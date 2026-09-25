package com.flexistaff.backend.controller;

import com.flexistaff.backend.dto.request.ClientRegistrationRequest;
import com.flexistaff.backend.dto.response.ApiResponse;
import com.flexistaff.backend.dto.response.ClientDto;
import com.flexistaff.backend.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<ClientDto>> registerClient(@Valid @RequestBody ClientRegistrationRequest request) {
        ClientDto registeredClient = clientService.registerClient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Client organization registered successfully", registeredClient));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClientDto>>> getAllClients() {
        List<ClientDto> clients = clientService.getAllClients();
        return ResponseEntity.ok(ApiResponse.success("Client records retrieved successfully", clients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClientDto>> getClientById(@PathVariable Long id) {
        ClientDto client = clientService.getClientById(id);
        return ResponseEntity.ok(ApiResponse.success("Client details retrieved successfully", client));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.ok(ApiResponse.success("Client account deleted successfully", null));
    }
}
