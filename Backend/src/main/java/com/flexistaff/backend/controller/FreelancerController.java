package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.FreelancerRegistrationRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.FreelancerDto;
import com.flexistaff.backend.service.FreelancerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

    private final FreelancerService freelancerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<FreelancerDto>> registerFreelancer(@Valid @RequestBody FreelancerRegistrationRequest request) {
        log.info("Received freelancer registration request for email: {}", request.getEmail());
        FreelancerDto registeredFreelancer = freelancerService.registerFreelancer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Freelancer talent registered successfully", registeredFreelancer));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FreelancerDto>>> getAllFreelancers() {
        try {
            List<FreelancerDto> freelancers = freelancerService.getAllFreelancers();
            log.info("Successfully fetched {} freelancers from PostgreSQL", freelancers.size());
            return ResponseEntity.ok(ApiResponse.success("Freelancer roster retrieved successfully", freelancers));
        } catch (Exception ex) {
            log.error("Error fetching freelancers from PostgreSQL: {}", ex.getMessage(), ex);
            throw ex;
        }
    }

    @GetMapping("/partner/{partnerCompanyId}")
    public ResponseEntity<ApiResponse<List<FreelancerDto>>> getFreelancersByPartnerCompany(@PathVariable Long partnerCompanyId) {
        List<FreelancerDto> freelancers = freelancerService.getFreelancersByPartnerCompany(partnerCompanyId);
        return ResponseEntity.ok(ApiResponse.success("Partner company workforce retrieved successfully", freelancers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDto>> getFreelancerById(@PathVariable Long id) {
        FreelancerDto freelancer = freelancerService.getFreelancerById(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer profile retrieved successfully", freelancer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDto>> updateFreelancer(
            @PathVariable Long id,
            @Valid @RequestBody com.flexistaff.backend.dto.request.UpdateFreelancerRequest request) {
        log.info("Received update freelancer request for id: {}, name: {}", id, request.getName());
        FreelancerDto updated = freelancerService.updateFreelancer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Freelancer profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFreelancer(@PathVariable Long id) {
        freelancerService.deleteFreelancer(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer account deleted successfully", null));
    }
}
