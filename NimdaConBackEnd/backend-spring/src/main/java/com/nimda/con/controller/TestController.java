package com.nimda.con.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {
    
    @GetMapping
    public String test() {
        System.out.println("=== TestController.test() 호출됨 ===");
        return "Test API is working!";
    }
    
    @GetMapping("/problems")
    public String testProblems() {
        System.out.println("=== TestController.testProblems() 호출됨 ===");
        return "Test Problems API is working!";
    }
}
