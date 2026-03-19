package com.nimda.cite.attachment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * 첨부파일 선택 삭제 요청용 DTO.
 * JSON 숫자가 Integer로 역직렬화되므로 setter에서 Long으로 통일
 */
@Getter
public class AttachmentDeleteRequestDto {

    private List<Long> fileIds;

    @JsonProperty("fileIds")
    public void setFileIds(List<?> raw) {
        if (raw == null) {
            this.fileIds = null;
            return;
        }
        this.fileIds = new ArrayList<>();
        for (Object o : raw) {
            if (o instanceof Number n) {
                this.fileIds.add(n.longValue());
            }
        }
    }
}
