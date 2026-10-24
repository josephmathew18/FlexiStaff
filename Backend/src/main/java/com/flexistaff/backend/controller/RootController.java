package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class RootController {

    /**
     * Forwards root and SPA client-side routes to index.html so React Router renders the UI
     */
    @GetMapping(value = {
            "/",
            "/login",
            "/register",
            "/apply",
            "/dashboard",
            "/dashboard/**",
            "/admin",
            "/admin/**",
            "/client",
            "/client/**",
            "/partner",
            "/partner/**",
            "/professional",
            "/professional/**",
            "/manager",
            "/manager/**",
            "/projects",
            "/projects/**",
            "/freelancers",
            "/freelancers/**",
            "/support",
            "/support/**",
            "/feedback",
            "/feedback/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }

    /**
     * Dedicated REST API health & status endpoint
     */
    @GetMapping("/api/status")
    @ResponseBody
    public ResponseEntity<ApiResponse<Map<String, String>>> apiStatus() {
        Map<String, String> info = Map.of(
                "application", "FlexiStaff Spring Boot REST API Service",
                "status", "UP & RUNNING",
                "version", "1.0.0",
                "h2Console", "/h2-console",
                "projectsApi", "/api/v1/projects"
        );
        return ResponseEntity.ok(ApiResponse.success("FlexiStaff Spring Boot Backend active", info));
    }
}
