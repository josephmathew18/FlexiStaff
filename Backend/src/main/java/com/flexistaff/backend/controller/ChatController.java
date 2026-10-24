package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.chat.*;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.repository.UserRepository;
import com.flexistaff.backend.service.ChatSecurityService;
import com.flexistaff.backend.service.ChatService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final ChatSecurityService chatSecurityService;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/chat";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf", "doc", "docx", "xls", "xlsx", "txt", "zip"
    );

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations(
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized: Please log in to access messages."));
        }
        List<ConversationDto> list = chatService.getUserConversations(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", list));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationDto>> createConversation(
            @Valid @RequestBody CreateConversationRequest body,
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        ConversationDto conv = chatService.getOrCreateConversation(currentUser, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conversation ready", conv));
    }

    @PostMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ConversationDto>> getOrCreateProjectGroupChat(
            @PathVariable Long projectId,
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        ConversationDto conv = chatService.getOrCreateProjectGroupChat(currentUser, projectId, null);
        return ResponseEntity.ok(ApiResponse.success("Project group chat ready", conv));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getMessages(
            @PathVariable Long id,
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<ChatMessageDto> messages = chatService.getConversationMessages(currentUser, id);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @PathVariable Long id,
            @RequestBody SendMessageRequest body,
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        ChatMessageDto msg = chatService.sendMessage(currentUser, id, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message sent", msg));
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser != null) {
            chatService.markConversationAsRead(currentUser, id);
        }
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        long count = (currentUser != null) ? chatService.getTotalUnreadCount(currentUser) : 0;
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("unreadCount", count)));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<ChatContactDto>>> getEligibleContacts(
            HttpServletRequest request,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId) {
        User currentUser = resolveUser(request, email, userId);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<ChatContactDto> contacts = chatSecurityService.getEligibleContacts(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Eligible contacts retrieved", contacts));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File cannot be empty"));
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File size exceeds 10MB limit"));
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Unsupported file extension: " + extension));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFilename = UUID.randomUUID().toString() + "-" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path targetLocation = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/api/v1/chat/attachments/" + uniqueFilename;
            String messageType = extension.matches("jpg|jpeg|png|gif|webp|svg") ? "IMAGE" : "FILE";

            Map<String, Object> data = new HashMap<>();
            data.put("attachmentUrl", fileUrl);
            data.put("attachmentName", originalFilename);
            data.put("attachmentSize", file.getSize());
            data.put("attachmentType", messageType);

            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", data));
        } catch (IOException ex) {
            log.error("Failed to store file upload", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload file"));
        }
    }

    @GetMapping("/attachments/{filename:.+}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ignored) {}

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception ex) {
            log.error("Error serving attachment", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    private User resolveUser(HttpServletRequest request, String emailParam, Long userIdParam) {
        // 1. Try Security Context Principal (standard JWT authentication)
        Optional<Long> authUserId = SecurityUtils.getCurrentUserId();
        if (authUserId.isPresent()) {
            return userRepository.findById(authUserId.get()).orElse(null);
        }

        // 2. Check X-User-Id header
        String headerId = request.getHeader("X-User-Id");
        if (headerId != null && !headerId.isBlank()) {
            try {
                return userRepository.findById(Long.parseLong(headerId.trim())).orElse(null);
            } catch (Exception ignored) {}
        }

        // 3. Check X-User-Email header
        String headerEmail = request.getHeader("X-User-Email");
        if (headerEmail != null && !headerEmail.isBlank()) {
            return userRepository.findByEmailIgnoreCase(headerEmail.trim()).orElse(null);
        }

        // 4. Query params fallback
        if (userIdParam != null) {
            return userRepository.findById(userIdParam).orElse(null);
        }
        if (emailParam != null && !emailParam.isBlank()) {
            return userRepository.findByEmailIgnoreCase(emailParam.trim()).orElse(null);
        }

        return null;
    }
}
