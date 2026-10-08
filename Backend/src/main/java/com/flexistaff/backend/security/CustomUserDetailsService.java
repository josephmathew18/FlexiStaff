package com.flexistaff.backend.security;

import com.flexistaff.backend.entity.User;
import com.flexistaff.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        String trimmed = emailOrUsername != null ? emailOrUsername.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(trimmed)
                .or(() -> userRepository.findByEmail(trimmed))
                .or(() -> {
                    if ("admin@gmail.com".equalsIgnoreCase(trimmed) || "admin".equalsIgnoreCase(trimmed) || "admin@flexistaff.ai".equalsIgnoreCase(trimmed)) {
                        return userRepository.findByEmailIgnoreCase("admin@flexistaff.com");
                    }
                    return java.util.Optional.empty();
                })
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> u.getFullName() != null && u.getFullName().trim().equalsIgnoreCase(trimmed))
                        .findFirst())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or name: " + emailOrUsername));

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return UserPrincipal.create(user);
    }
}
