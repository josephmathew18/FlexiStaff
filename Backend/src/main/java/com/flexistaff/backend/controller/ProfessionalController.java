package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.service.ProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/professionals")
@RequiredArgsConstructor
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllProfessionals() {
        List<UserDto> professionals = professionalService.getAllProfessionals();
        return ResponseEntity.ok(ApiResponse.success("Professionals list retrieved successfully", professionals));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAvailableProfessionals() {
        List<UserDto> professionals = professionalService.getAvailableProfessionals();
        return ResponseEntity.ok(ApiResponse.success("Available professionals list retrieved successfully", professionals));
    }
}
