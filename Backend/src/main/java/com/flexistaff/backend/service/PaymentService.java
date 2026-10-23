package com.flexistaff.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flexistaff.backend.config.RazorpayConfig;
import com.flexistaff.backend.dto.request.CreatePaymentOrderRequest;
import com.flexistaff.backend.dto.request.VerifyPaymentRequest;
import com.flexistaff.backend.dto.response.PaymentDto;
import com.flexistaff.backend.dto.response.PaymentOrderResponse;
import com.flexistaff.backend.dto.response.ProjectPaymentSummaryDto;
import com.flexistaff.backend.dto.response.ReceiptDto;
import com.flexistaff.backend.entity.Payment;
import com.flexistaff.backend.entity.Project;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.entity.enums.PaymentStatus;
import com.flexistaff.backend.entity.enums.ProjectStatus;
import com.flexistaff.backend.exception.BadRequestException;
import com.flexistaff.backend.exception.ResourceNotFoundException;
import com.flexistaff.backend.exception.UnauthorizedException;
import com.flexistaff.backend.repository.PaymentRepository;
import com.flexistaff.backend.repository.ProjectRepository;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RazorpayConfig razorpayConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ProjectPaymentSummaryDto getProjectPaymentSummary(Long projectId, Long currentUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        validateProjectAccess(project, currentUserId);

        BigDecimal agreedCost = project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO;
        BigDecimal totalPaid = paymentRepository.sumPaidAmountByProjectId(projectId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal remainingBalance = agreedCost.subtract(totalPaid);
        if (remainingBalance.compareTo(BigDecimal.ZERO) < 0) {
            remainingBalance = BigDecimal.ZERO;
        }

        String paymentStatus;
        boolean isEligible = true;

        if (agreedCost.compareTo(BigDecimal.ZERO) <= 0) {
            paymentStatus = "NO_COST_AGREED";
            isEligible = false;
        } else if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
            paymentStatus = "PAID";
            isEligible = false;
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            paymentStatus = "PARTIALLY_PAID";
        } else {
            paymentStatus = "UNPAID";
        }

        if (project.getStatus() == ProjectStatus.REJECTED ||
            project.getStatus() == ProjectStatus.DECLINED ||
            project.getStatus() == ProjectStatus.CANCELLED) {
            isEligible = false;
        }

        List<PaymentDto> payments = paymentRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToPaymentDto)
                .collect(Collectors.toList());

        return ProjectPaymentSummaryDto.builder()
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .projectStatus(project.getStatus() != null ? project.getStatus().name() : "UNKNOWN")
                .totalAgreedCost(agreedCost.setScale(2, RoundingMode.HALF_UP))
                .totalPaid(totalPaid.setScale(2, RoundingMode.HALF_UP))
                .remainingBalance(remainingBalance.setScale(2, RoundingMode.HALF_UP))
                .paymentStatus(paymentStatus)
                .isEligibleForPayment(isEligible)
                .payments(payments)
                .build();
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request, Long currentUserId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        validateProjectAccess(project, currentUserId);

        if (project.getStatus() == ProjectStatus.REJECTED ||
            project.getStatus() == ProjectStatus.DECLINED ||
            project.getStatus() == ProjectStatus.CANCELLED) {
            throw new BadRequestException("Cannot make payments for a cancelled or rejected project.");
        }

        BigDecimal agreedCost = project.getBudget();
        if (agreedCost == null || agreedCost.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This project does not have an approved budget/cost agreed yet. Please contact your manager.");
        }

        BigDecimal totalPaid = paymentRepository.sumPaidAmountByProjectId(project.getId());
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal remainingBalance = agreedCost.subtract(totalPaid);
        if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This project is already fully paid. Outstanding balance is 0.00.");
        }

        BigDecimal payableAmount;
        if (Boolean.TRUE.equals(request.getIsFullBalance())) {
            payableAmount = remainingBalance.setScale(2, RoundingMode.HALF_UP);
        } else if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Payment amount must be greater than zero.");
            }
            if (request.getAmount().compareTo(remainingBalance) > 0) {
                // If amount is within agreedCost (e.g. from slight frontend cache staleness when paying full balance),
                // automatically cap to remaining balance instead of blocking checkout.
                if (request.getAmount().compareTo(agreedCost) <= 0) {
                    log.info("Requested amount {} exceeds remaining balance {}, capping to remaining balance", request.getAmount(), remainingBalance);
                    payableAmount = remainingBalance.setScale(2, RoundingMode.HALF_UP);
                } else {
                    throw new BadRequestException("Payment amount of ₹" + request.getAmount() +
                            " exceeds the outstanding balance of ₹" + remainingBalance.setScale(2, RoundingMode.HALF_UP));
                }
            } else {
                payableAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
            }
        } else {
            payableAmount = remainingBalance.setScale(2, RoundingMode.HALF_UP);
        }

        long amountInPaise = payableAmount.multiply(new BigDecimal(100)).longValueExact();
        String receiptNumber = "RCP-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        if (!razorpayConfig.isConfigured()) {
            throw new BadRequestException("Razorpay credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment or application.yml to accept payments.");
        }

        // Call Razorpay Server-Side Orders API
        String orderId = callRazorpayCreateOrder(amountInPaise, receiptNumber, project);

        // Record initial payment in database with status CREATED
        Payment payment = Payment.builder()
                .project(project)
                .client(project.getClient())
                .amount(payableAmount)
                .currency(razorpayConfig.getCurrency())
                .razorpayOrderId(orderId)
                .status(PaymentStatus.CREATED)
                .receiptNumber(receiptNumber)
                .notes(request.getNotes() != null ? request.getNotes() : "Payment for project: " + project.getTitle())
                .build();

        paymentRepository.save(payment);

        User clientUser = project.getClient();
        String clientName = clientUser != null ? clientUser.getFullName() : "Client";
        String clientEmail = clientUser != null ? clientUser.getEmail() : "";
        String clientPhone = clientUser != null ? clientUser.getPhone() : "";

        return PaymentOrderResponse.builder()
                .orderId(orderId)
                .amount(payableAmount)
                .amountInPaise(amountInPaise)
                .currency(razorpayConfig.getCurrency())
                .keyId(razorpayConfig.getKeyId())
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .clientName(clientName)
                .clientEmail(clientEmail)
                .clientPhone(clientPhone)
                .companyName(razorpayConfig.getCompanyName())
                .receiptNumber(receiptNumber)
                .isTestMode(razorpayConfig.getKeyId().startsWith("rzp_test_"))
                .build();
    }

    @Transactional
    public PaymentDto verifyPayment(VerifyPaymentRequest request, Long currentUserId) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", request.getRazorpayOrderId()));

        // Idempotency: if already verified as SUCCESS, return existing record
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment for order {} is already confirmed and successful", request.getRazorpayOrderId());
            return mapToPaymentDto(payment);
        }

        // Cryptographic HMAC-SHA256 verification
        boolean isValid = razorpayConfig.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setFailureReason("Cryptographic signature mismatch");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed: Invalid cryptographic signature.");
        }

        // Fetch payment details from Razorpay to verify capture status and extract payment method
        String paymentMethod = "Razorpay Checkout";
        try {
            JsonNode paymentDetails = fetchRazorpayPaymentDetails(request.getRazorpayPaymentId());
            if (paymentDetails != null) {
                if (paymentDetails.has("method")) {
                    paymentMethod = paymentDetails.get("method").asText();
                }
                String rzpStatus = paymentDetails.has("status") ? paymentDetails.get("status").asText() : "";
                if ("failed".equalsIgnoreCase(rzpStatus)) {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason(paymentDetails.has("error_description") ? paymentDetails.get("error_description").asText() : "Razorpay reported failure");
                    paymentRepository.save(payment);
                    throw new BadRequestException("Razorpay reported payment status as failed.");
                }
            }
        } catch (Exception ex) {
            log.warn("Notice querying Razorpay payment details for {}: {}", request.getRazorpayPaymentId(), ex.getMessage());
        }

        // Mark payment confirmed and successful
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        log.info("Successfully verified and recorded payment ID {} for project ID {}", saved.getId(), saved.getProject().getId());

        return mapToPaymentDto(saved);
    }

    @Transactional
    public void processWebhook(String rawPayload, String signatureHeader) {
        if (!razorpayConfig.verifyWebhookSignature(rawPayload, signatureHeader)) {
            log.warn("Rejected webhook: invalid signature header");
            throw new BadRequestException("Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText("");
            log.info("Processing verified Razorpay webhook event: {}", event);

            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            String orderId = paymentEntity.path("order_id").asText(null);
            String paymentId = paymentEntity.path("id").asText(null);
            String method = paymentEntity.path("method").asText("Webhook");

            if (orderId == null || orderId.trim().isEmpty()) {
                log.info("Webhook event {} does not contain order_id, ignoring", event);
                return;
            }

            Optional<Payment> optionalPayment = paymentRepository.findByRazorpayOrderId(orderId);
            if (optionalPayment.isEmpty()) {
                log.warn("Payment order {} not found in database for webhook event", orderId);
                return;
            }

            Payment payment = optionalPayment.get();

            // Never downgrade a SUCCESS payment
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.info("Payment order {} already marked SUCCESS, skipping webhook mutation", orderId);
                return;
            }

            if ("payment.captured".equalsIgnoreCase(event) || "order.paid".equalsIgnoreCase(event)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                if (paymentId != null) payment.setRazorpayPaymentId(paymentId);
                payment.setPaymentMethod(method);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
                log.info("Webhook updated payment order {} to SUCCESS", orderId);
            } else if ("payment.failed".equalsIgnoreCase(event)) {
                String errorDesc = paymentEntity.path("error_description").asText("Payment failed at gateway");
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(errorDesc);
                paymentRepository.save(payment);
                log.info("Webhook updated payment order {} to FAILED: {}", orderId, errorDesc);
            }
        } catch (Exception ex) {
            log.error("Failed to parse and process Razorpay webhook payload: {}", ex.getMessage(), ex);
            throw new BadRequestException("Webhook payload processing failed");
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getClientPaymentHistory(Long currentUserId) {
        if (currentUserId == null) {
            return Collections.emptyList();
        }
        return paymentRepository.findByClientIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::mapToPaymentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReceiptDto getReceipt(Long paymentId, Long currentUserId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        validateProjectAccess(payment.getProject(), currentUserId);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Official receipts are only generated for verified, successful payments.");
        }

        User client = payment.getClient();
        String clientName = client != null ? client.getFullName() : "Client";
        String clientEmail = client != null ? client.getEmail() : "";
        String clientPhone = client != null ? client.getPhone() : "";
        String companyName = client != null && client.getClientProfile() != null
                ? client.getClientProfile().getCompanyName()
                : clientName;

        return ReceiptDto.builder()
                .receiptNumber(payment.getReceiptNumber())
                .paymentId(payment.getId())
                .projectId(payment.getProject().getId())
                .projectTitle(payment.getProject().getTitle())
                .clientId(client != null ? client.getId() : null)
                .clientName(clientName)
                .clientCompanyName(companyName)
                .clientEmail(clientEmail)
                .clientPhone(clientPhone)
                .amountPaid(payment.getAmount().setScale(2, RoundingMode.HALF_UP))
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "Online / Razorpay")
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .paymentStatus(payment.getStatus().name())
                .paymentDate(payment.getPaidAt() != null ? payment.getPaidAt() : payment.getCreatedAt())
                .issuedBy(razorpayConfig.getCompanyName())
                .build();
    }

    private String callRazorpayCreateOrder(long amountInPaise, String receiptNumber, Project project) {
        String url = "https://api.razorpay.com/v1/orders";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret(), StandardCharsets.UTF_8);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountInPaise);
        body.put("currency", razorpayConfig.getCurrency());
        body.put("receipt", receiptNumber);

        Map<String, String> notes = new HashMap<>();
        notes.put("projectId", String.valueOf(project.getId()));
        notes.put("projectTitle", project.getTitle());
        notes.put("clientId", String.valueOf(project.getClient().getId()));
        body.put("notes", notes);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode json = objectMapper.readTree(response.getBody());
                    if (json.has("id")) {
                        return json.get("id").asText();
                    }
                }
                throw new BadRequestException("Razorpay did not return an order ID");
            } catch (HttpStatusCodeException ex) {
                log.warn("Razorpay API order creation attempt {} failed with HTTP {}: {}", attempt, ex.getStatusCode(), ex.getResponseBodyAsString());
                if (ex.getStatusCode().value() == 429 && attempt < maxAttempts) {
                    try {
                        Thread.sleep(800L * attempt);
                    } catch (InterruptedException ignored) {}
                    continue;
                }
                if (ex.getStatusCode().value() == 429) {
                    log.info("Razorpay order API rate-limited (HTTP 429), proceeding with standard direct checkout fallback");
                    return null;
                }
                try {
                    JsonNode errJson = objectMapper.readTree(ex.getResponseBodyAsString());
                    String rzpMsg = errJson.path("error").path("description").asText(ex.getMessage());
                    throw new BadRequestException("Razorpay error: " + rzpMsg);
                } catch (Exception e) {
                    throw new BadRequestException("Razorpay API error: " + ex.getMessage());
                }
            } catch (BadRequestException bre) {
                throw bre;
            } catch (Exception ex) {
                log.error("Unexpected error contacting Razorpay on attempt {}: {}", attempt, ex.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(800L * attempt);
                    } catch (InterruptedException ignored) {}
                    continue;
                }
                throw new BadRequestException("Unable to contact Razorpay payment gateway: " + ex.getMessage());
            }
        }
        return null;
    }

    private JsonNode fetchRazorpayPaymentDetails(String paymentId) {
        try {
            String url = "https://api.razorpay.com/v1/payments/" + paymentId;
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret(), StandardCharsets.UTF_8);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
        } catch (Exception ex) {
            log.warn("Could not retrieve payment details from Razorpay: {}", ex.getMessage());
        }
        return null;
    }

    private void validateProjectAccess(Project project, Long currentUserId) {
        if (currentUserId == null) return;
        User current = userRepository.findById(currentUserId).orElse(null);
        if (current == null) return;

        String role = current.getRole() != null ? current.getRole().name() : "";
        if (role.contains("ADMIN") || role.contains("MANAGER")) {
            return; // Admin & Manager can inspect any project payment summary
        }

        if (project.getClient() != null && !project.getClient().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to view or make payments for this project.");
        }
    }

    public PaymentDto mapToPaymentDto(Payment p) {
        Project proj = p.getProject();
        User client = p.getClient();
        return PaymentDto.builder()
                .id(p.getId())
                .projectId(proj != null ? proj.getId() : null)
                .projectTitle(proj != null ? proj.getTitle() : "Project")
                .clientId(client != null ? client.getId() : null)
                .clientName(client != null ? client.getFullName() : "Client")
                .clientEmail(client != null ? client.getEmail() : "")
                .amount(p.getAmount().setScale(2, RoundingMode.HALF_UP))
                .currency(p.getCurrency())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .status(p.getStatus())
                .paymentMethod(p.getPaymentMethod())
                .receiptNumber(p.getReceiptNumber())
                .notes(p.getNotes())
                .failureReason(p.getFailureReason())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
