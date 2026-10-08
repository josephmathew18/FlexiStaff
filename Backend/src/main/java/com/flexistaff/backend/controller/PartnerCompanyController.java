package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.PartnerCompanyRegistrationRequest;
import com.flexistaff.backend.dto.request.UpdatePartnerCompanyRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.PartnerCompanyDto;
import com.flexistaff.backend.service.PartnerCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerCompanyController {

    private final PartnerCompanyService partnerCompanyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PartnerCompanyDto>>> getAllPartners() {
        List<PartnerCompanyDto> list = partnerCompanyService.getAllPartners();
        return ResponseEntity.ok(ApiResponse.success("Partner organizations retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PartnerCompanyDto>> getPartnerById(@PathVariable Long id) {
        PartnerCompanyDto partner = partnerCompanyService.getPartnerById(id);
        return ResponseEntity.ok(ApiResponse.success("Partner organization details retrieved", partner));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PartnerCompanyDto>> createPartner(
            @Valid @RequestBody PartnerCompanyRegistrationRequest request) {
        PartnerCompanyDto partner = partnerCompanyService.registerPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Partner organization registered successfully", partner));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<PartnerCompanyDto>> registerPartner(
            @Valid @RequestBody PartnerCompanyRegistrationRequest request) {
        PartnerCompanyDto partner = partnerCompanyService.registerPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Partner organization registered successfully", partner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PartnerCompanyDto>> updatePartner(
            @PathVariable Long id,
            @RequestBody UpdatePartnerCompanyRequest request) {
        PartnerCompanyDto updated = partnerCompanyService.updatePartner(id, request);
        return ResponseEntity.ok(ApiResponse.success("Partner organization updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePartner(@PathVariable Long id) {
        partnerCompanyService.deletePartner(id);
        return ResponseEntity.ok(ApiResponse.success("Partner organization deleted successfully", null));
    }
}
