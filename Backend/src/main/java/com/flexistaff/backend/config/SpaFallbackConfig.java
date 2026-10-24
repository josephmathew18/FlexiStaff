package com.flexistaff.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import java.util.Map;

/**
 * Ensures any deep link, refresh, or client-side route in the Single Page Application
 * resolves to index.html instead of returning a 404 error page/JSON.
 */
@Configuration
public class SpaFallbackConfig implements ErrorViewResolver {

    @Override
    public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
        if (status == HttpStatus.NOT_FOUND) {
            String path = request.getRequestURI();
            // Do not forward actual backend API, WebSocket, or static asset requests
            if (path != null && !path.startsWith("/api") && !path.startsWith("/ws") && !path.contains(".")) {
                return new ModelAndView("forward:/index.html", HttpStatus.OK);
            }
        }
        return null;
    }
}
