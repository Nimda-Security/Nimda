package com.nimda.con.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AppController {
    
    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Nimda Contest Platform API");
        response.put("status", "running");
        return response;


        
    }
    
    @GetMapping("/api")
    public Map<String, String> api() {
        Map<String, String> response = new HashMap<>();
        response.put("message", 
        "Nimda Contest Platform API");
        response.put("version", "1.0.0");
        return response;
    }

}
