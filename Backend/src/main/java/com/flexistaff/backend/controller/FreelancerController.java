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

@RestController
@RequestMapping("/api/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

    private final FreelancerService freelancerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<FreelancerDto>> registerFreelancer(@Valid @RequestBody FreelancerRegistrationRequest request) {
        FreelancerDto registeredFreelancer = freelancerService.registerFreelancer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Freelancer talent registered successfully", registeredFreelancer));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FreelancerDto>>> getAllFreelancers() {
        List<FreelancerDto> freelancers = freelancerService.getAllFreelancers();
        return ResponseEntity.ok(ApiResponse.success("Freelancer roster retrieved successfully", freelancers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FreelancerDto>> getFreelancerById(@PathVariable Long id) {
        FreelancerDto freelancer = freelancerService.getFreelancerById(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer profile retrieved successfully", freelancer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFreelancer(@PathVariable Long id) {
        freelancerService.deleteFreelancer(id);
        return ResponseEntity.ok(ApiResponse.success("Freelancer account deleted successfully", null));
    }
}
