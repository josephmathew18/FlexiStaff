package com.flexistaff.backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private String content;
    private String messageType;
    private String attachmentUrl;
    private String attachmentName;
    private Long attachmentSize;
    private String attachmentType;
}
