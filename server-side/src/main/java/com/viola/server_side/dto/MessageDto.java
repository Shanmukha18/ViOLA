package com.viola.server_side.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String content;
    private UserDto sender;
    private UserDto receiver;
    private Long rideId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
