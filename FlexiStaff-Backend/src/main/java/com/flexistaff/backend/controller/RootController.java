package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<ApiResponse<Map<String, String>>> rootWelcome() {
        Map<String, String> info = Map.of(
                "application", "FlexiStaff Spring Boot REST API Service",
                "status", "UP & RUNNING",
                "version", "1.0.0",
                "h2Console", "http://localhost:8080/h2-console",
                "projectsApi", "http://localhost:8080/api/v1/projects"
        );
        return ResponseEntity.ok(ApiResponse.success("FlexiStaff Spring Boot Backend active", info));
    }
}
