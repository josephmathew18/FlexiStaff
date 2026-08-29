package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.LoginRequest;
import com.flexistaff.backend.dto.request.RegisterRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.AuthResponse;
import com.flexistaff.backend.dto.response.UserDto;
import com.flexistaff.backend.security.UserPrincipal;
import com.flexistaff.backend.service.AuthService;
import com.flexistaff.backend.service.UserService;
import com.flexistaff.backend.utility.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDto registeredUser = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", registeredUser));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Unauthenticated access"));
        UserDto currentUser = userService.getUserById(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved successfully", currentUser));
    }
}
