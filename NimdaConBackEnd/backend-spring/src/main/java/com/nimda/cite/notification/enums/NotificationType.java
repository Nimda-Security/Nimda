package com.nimda.cite.notification.enums;

    public enum NotificationType {
        PushLikeButtonAtBoard("님이 내 게시글을 좋아합니다."),
        PushLikeButtonAtComment("님이 내 댓글을 좋아합니다."),
        AddCommentAtBoard("님이 내 게시글에 댓글을 남겼습니다."),
        AddChildComment("님이 답글을 남겼습니다.");

        private final String suffix;

        NotificationType(String suffix) {
            this.suffix = suffix;
        }

        public String generateMessage(String senderNickname) {
            return senderNickname + suffix;
        }
    }
