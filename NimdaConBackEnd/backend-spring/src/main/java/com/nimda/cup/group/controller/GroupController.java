package com.nimda.cup.group.controller;

import com.nimda.cup.group.dto.GroupCreateRequest;
import com.nimda.cup.group.dto.GroupMemberAddRequest;
import com.nimda.cup.group.dto.GroupMemberResponse;
import com.nimda.cup.group.dto.GroupResponse;
import com.nimda.cup.group.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    // * 스터디 그룹 생성 API *
    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@Valid @RequestBody GroupCreateRequest request) {
        GroupResponse response = groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupMemberResponse> addMember(
            @PathVariable Long groupId,
            @Valid @RequestBody GroupMemberAddRequest request) {
        GroupMemberResponse response = groupService.addMember(groupId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
