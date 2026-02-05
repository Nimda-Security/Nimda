/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for osx10.20 (arm64)
--
-- Host: nimda-db.cpu8uk0eauv0.ap-northeast-2.rds.amazonaws.com    Database: nimda_con
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `nimda_con`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nimda_con` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `nimda_con`;

--
-- Table structure for table `authority`
--

DROP TABLE IF EXISTS `authority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `authority` (
  `authority_name` varchar(50) NOT NULL,
  PRIMARY KEY (`authority_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authority`
--

LOCK TABLES `authority` WRITE;
/*!40000 ALTER TABLE `authority` DISABLE KEYS */;
INSERT INTO `authority` VALUES
('ROLE_ADMIN');
/*!40000 ALTER TABLE `authority` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board`
--

DROP TABLE IF EXISTS `board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `board` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `board_type` enum('NEWS','ACADEMIC','COMMUNITY','QNA','FREE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filepath` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5vlh90qyii65ixwsbnafd55ud` (`user_id`),
  CONSTRAINT `FK5vlh90qyii65ixwsbnafd55ud` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board`
--

LOCK TABLES `board` WRITE;
/*!40000 ALTER TABLE `board` DISABLE KEYS */;
INSERT INTO `board` VALUES
(1,'NEWS','test','2025-12-12 09:27:39.942032','b17a4cdf-d511-4a85-8cab-0c00bf35ac1b_KakaoTalk_20251211_132033331.png','/api/download/b17a4cdf-d511-4a85-8cab-0c00bf35ac1b_KakaoTalk_20251211_132033331.png','test','2025-12-12 09:27:39.942032',8),
(2,'NEWS','test1','2025-12-12 09:50:16.951299',NULL,NULL,'test1','2025-12-12 09:50:16.951299',8),
(3,'NEWS','test2','2025-12-12 12:07:19.533270','004e96c5-68f0-4186-acd3-84b70a9d0dfc_KakaoTalk_20251211_132033331.png','/api/download/004e96c5-68f0-4186-acd3-84b70a9d0dfc_KakaoTalk_20251211_132033331.png','test2','2025-12-12 12:07:19.533270',8),
(4,'NEWS','test3','2025-12-12 12:15:35.017416',NULL,NULL,'test3','2025-12-12 12:15:35.017416',8),
(5,'NEWS','test4','2025-12-12 12:15:44.109734',NULL,NULL,'test4','2025-12-12 12:15:44.109734',8),
(6,'NEWS','test5','2025-12-12 12:15:53.984609',NULL,NULL,'test5','2025-12-12 12:15:53.984609',8),
(7,'NEWS','test6','2025-12-12 12:16:05.047763',NULL,NULL,'test6','2025-12-12 12:16:05.047763',8),
(8,'NEWS','test7','2025-12-12 12:16:18.407197',NULL,NULL,'test7','2025-12-12 12:16:18.407197',8),
(9,'NEWS','test8','2025-12-12 12:16:26.910360',NULL,NULL,'test8','2025-12-12 12:16:26.910360',8),
(10,'NEWS','test9','2025-12-12 12:16:34.788540',NULL,NULL,'test9','2025-12-12 12:16:34.788540',8),
(11,'NEWS','test10','2025-12-12 12:16:44.986490',NULL,NULL,'test10','2025-12-12 12:16:44.986490',8),
(12,'NEWS','첨부파일 링크를 확인해주세요.','2025-12-12 12:17:34.265612','e050ac4d-1ce2-44b4-bc3c-ee76d6b84647_KakaoTalk_20251211_132033331.png','/api/download/e050ac4d-1ce2-44b4-bc3c-ee76d6b84647_KakaoTalk_20251211_132033331.png','대학졸업 프로젝트 지원사업 입니다.','2025-12-12 12:17:34.265612',8),
(13,'ACADEMIC','test','2025-12-16 01:37:50.175383',NULL,NULL,'test','2025-12-16 01:37:50.175383',8);
/*!40000 ALTER TABLE `board` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contest`
--

DROP TABLE IF EXISTS `contest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest` (
  `contest_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_time` datetime(6) NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `status` enum('UPCOMING','RUNNING','ENDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` bigint NOT NULL,
  PRIMARY KEY (`contest_id`),
  KEY `FKa64beyokxao0s2e3d5so2b1et` (`created_by`),
  CONSTRAINT `FKa64beyokxao0s2e3d5so2b1et` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest`
--

LOCK TABLES `contest` WRITE;
/*!40000 ALTER TABLE `contest` DISABLE KEYS */;
/*!40000 ALTER TABLE `contest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contest_participant`
--

DROP TABLE IF EXISTS `contest_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest_participant` (
  `participant_id` bigint NOT NULL AUTO_INCREMENT,
  `registered_at` datetime(6) NOT NULL,
  `contest_id` bigint NOT NULL,
  `team_id` bigint NOT NULL,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `UKegsmavrg4k8o35a7q667ijrqw` (`contest_id`,`team_id`),
  KEY `FKtr57yrw81daduh5utuup3hh6q` (`team_id`),
  CONSTRAINT `FKbclktcygwt2v6g2i2hdhm5bpl` FOREIGN KEY (`contest_id`) REFERENCES `contest` (`contest_id`),
  CONSTRAINT `FKtr57yrw81daduh5utuup3hh6q` FOREIGN KEY (`team_id`) REFERENCES `study_groups` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_participant`
--

LOCK TABLES `contest_participant` WRITE;
/*!40000 ALTER TABLE `contest_participant` DISABLE KEYS */;
/*!40000 ALTER TABLE `contest_participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contest_problem`
--

DROP TABLE IF EXISTS `contest_problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest_problem` (
  `contest_problem_id` bigint NOT NULL AUTO_INCREMENT,
  `problem_alias` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score` int DEFAULT NULL,
  `contest_id` bigint NOT NULL,
  `problem_id` bigint NOT NULL,
  PRIMARY KEY (`contest_problem_id`),
  UNIQUE KEY `UKdo0etut8alscew068220iqhu6` (`contest_id`,`problem_id`),
  KEY `FK89kbqtxgcj1ifiyel0mdad9lk` (`problem_id`),
  CONSTRAINT `FK89kbqtxgcj1ifiyel0mdad9lk` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`),
  CONSTRAINT `FKfb88fbs9sfee0itty6htkqrfu` FOREIGN KEY (`contest_id`) REFERENCES `contest` (`contest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_problem`
--

LOCK TABLES `contest_problem` WRITE;
/*!40000 ALTER TABLE `contest_problem` DISABLE KEYS */;
/*!40000 ALTER TABLE `contest_problem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_memberships`
--

DROP TABLE IF EXISTS `group_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_memberships` (
  `membership_id` bigint NOT NULL AUTO_INCREMENT,
  `joined_at` datetime(6) NOT NULL,
  `left_at` datetime(6) DEFAULT NULL,
  `role` enum('LEADER','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `UK9av1qwqwmki0a1whrqvi26t8t` (`user_id`,`group_id`),
  KEY `FK9a30xs54cckm2r9pcvjlo5odo` (`group_id`),
  CONSTRAINT `FK9a30xs54cckm2r9pcvjlo5odo` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`group_id`),
  CONSTRAINT `FKlq7o99bv8w6paut0ih5yhboia` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_memberships`
--

LOCK TABLES `group_memberships` WRITE;
/*!40000 ALTER TABLE `group_memberships` DISABLE KEYS */;
/*!40000 ALTER TABLE `group_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `judge_results`
--

DROP TABLE IF EXISTS `judge_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `judge_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `error_output` text,
  `execution_time` bigint DEFAULT NULL,
  `judged_at` datetime(6) NOT NULL,
  `memory_usage` bigint DEFAULT NULL,
  `message` varchar(500) DEFAULT NULL,
  `output` text,
  `score` int DEFAULT NULL,
  `status` enum('PENDING','JUDGING','ACCEPTED','WRONG_ANSWER','TIME_LIMIT_EXCEEDED','MEMORY_LIMIT_EXCEEDED','RUNTIME_ERROR','COMPILATION_ERROR','SYSTEM_ERROR') NOT NULL,
  `submission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_xcbwl3f3jh7ispnqe3tij5c2` (`submission_id`),
  CONSTRAINT `FKbjqe7xbbxd2tahb30bh64px22` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=664 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `judge_results`
--

LOCK TABLES `judge_results` WRITE;
/*!40000 ALTER TABLE `judge_results` DISABLE KEYS */;
INSERT INTO `judge_results` VALUES
(156,'',0,'2025-11-27 09:17:04.585234',0,'오답입니다. 입력: 4\n3\n0\n4\n0, 예상: 0, 실제: ',NULL,0,'WRONG_ANSWER',156),
(157,'',0,'2025-11-27 10:31:06.071079',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: Hello, NIMDA!\nHello, NIMDA!\nHello, NIMDA!',NULL,0,'WRONG_ANSWER',157),
(158,NULL,0,'2025-11-27 10:32:02.529232',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',158),
(159,NULL,0,'2025-11-27 10:34:03.599350',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',159),
(160,NULL,0,'2025-11-27 10:34:17.613400',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',160),
(161,'',0,'2025-11-27 10:34:21.058361',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: \"Hello, NIMDA\"\n\"Hello, NIMDA\"\n\"Hello, NIMDA\"',NULL,0,'WRONG_ANSWER',161),
(162,NULL,0,'2025-11-27 10:34:55.670419',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',162),
(163,'/tmp/nimda-judge/TEAM2_1_163/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM2_1_163/solution.cpp:4:9: error: ‘scanf_s’ was not declared in this scope; did you mean ‘scanf’?\n    4 |         scanf_s(\"%d\", &N);\n      |         ^~~~~~~\n      |         scanf\n',0,'2025-11-27 10:36:39.987390',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',163),
(164,'/tmp/nimda-judge/TEAM2_1_164/solution.c: In function ‘main’:\n/tmp/nimda-judge/TEAM2_1_164/solution.c:4:9: warning: implicit declaration of function ‘scanf_s’; did you mean ‘scanf’? [-Wimplicit-function-declaration]\n    4 |         scanf_s(\"%d\", &N);\n      |         ^~~~~~~\n      |         scanf\n/usr/bin/ld: /tmp/ccx9Uajm.o: in function `main\':\nsolution.c:(.text.startup+0x27): undefined reference to `scanf_s\'\ncollect2: error: ld returned 1 exit status\n',0,'2025-11-27 10:36:46.552369',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',164),
(165,NULL,0,'2025-11-27 10:37:02.027954',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',165),
(166,NULL,0,'2025-11-27 10:39:09.722158',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',166),
(167,'',0,'2025-11-27 10:42:24.038421',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: \"Hello,Nimda!\"\n\"Hello,Nimda!\"\n\"Hello,Nimda!\"',NULL,0,'WRONG_ANSWER',167),
(168,'',0,'2025-11-27 10:43:01.922758',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: \"Hello, Nimda!\"\n\"Hello, Nimda!\"\n\"Hello, Nimda!\"',NULL,0,'WRONG_ANSWER',168),
(169,NULL,0,'2025-11-27 10:43:24.374437',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',169),
(170,NULL,0,'2025-11-27 10:43:28.721412',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',170),
(171,NULL,0,'2025-11-27 10:43:58.848569',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',171),
(172,'',0,'2025-11-27 10:49:46.055524',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: ',NULL,0,'WRONG_ANSWER',172),
(173,'',0,'2025-11-27 10:51:33.011025',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 23 60',NULL,0,'WRONG_ANSWER',173),
(174,'',0,'2025-11-27 10:51:36.028576',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 24 0',NULL,0,'WRONG_ANSWER',174),
(175,'',0,'2025-11-27 10:51:47.366681',0,'오답입니다. 입력: 0 46, 예상: 0 1, 실제: ',NULL,0,'WRONG_ANSWER',175),
(176,NULL,0,'2025-11-27 10:52:47.762284',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',176),
(177,'',0,'2025-11-27 10:53:38.873439',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 24 0',NULL,0,'WRONG_ANSWER',177),
(178,'',0,'2025-11-27 10:54:24.058159',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 24 0',NULL,0,'WRONG_ANSWER',178),
(179,NULL,0,'2025-11-27 10:55:04.372016',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',179),
(180,'',0,'2025-11-27 10:55:13.769002',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 24 0',NULL,0,'WRONG_ANSWER',180),
(181,NULL,0,'2025-11-27 10:56:08.128223',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',181),
(182,'',0,'2025-11-27 10:56:32.080179',0,'오답입니다. 입력: 0 46, 예상: 0 1, 실제: 24 1',NULL,0,'WRONG_ANSWER',182),
(183,NULL,0,'2025-11-27 10:58:41.481088',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',183),
(184,NULL,0,'2025-11-27 11:01:09.365230',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',184),
(185,NULL,0,'2025-11-27 11:08:36.827470',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',185),
(186,NULL,0,'2025-11-27 11:14:38.339267',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',186),
(187,'',0,'2025-11-27 11:19:17.685184',0,'오답입니다. 입력: 5\n1\n2\n3\n4\n5, 예상: 15, 실제: 6',NULL,0,'WRONG_ANSWER',187),
(188,'',0,'2025-11-27 11:22:49.009136',0,'오답입니다. 입력: 10\n1\n3\n5\n4\n0\n0\n7\n0\n0\n6, 예상: 7, 실제: 13',NULL,0,'WRONG_ANSWER',188),
(189,'',0,'2025-11-27 11:31:10.040670',0,'오답입니다. 입력: 10\n1\n3\n5\n4\n0\n0\n7\n0\n0\n6, 예상: 7, 실제: 12',NULL,0,'WRONG_ANSWER',189),
(190,'',0,'2025-11-27 11:37:17.316255',0,'오답입니다. 입력: 0 45, 예상: 0 0, 실제: 22 0',NULL,0,'WRONG_ANSWER',190),
(191,NULL,0,'2025-11-27 11:41:50.543139',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',191),
(192,'',0,'2025-11-27 11:41:52.323967',0,'오답입니다. 입력: 10 45, 예상: 10 0, 실제: 9 0',NULL,0,'WRONG_ANSWER',192),
(193,'',0,'2025-11-27 11:43:10.126735',0,'오답입니다. 입력: 0 46, 예상: 0 1, 실제: 23 1',NULL,0,'WRONG_ANSWER',193),
(194,NULL,0,'2025-11-27 11:49:42.502999',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',10,'ACCEPTED',194),
(195,'',0,'2025-11-27 11:52:26.185575',0,'오답입니다. 입력: 3 3 1\nO..\n.O.\n..O, 예상: O..\n.O.\n..O, 실제: ...\n...\n...',NULL,0,'WRONG_ANSWER',195),
(196,NULL,0,'2025-11-27 11:52:26.773987',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',196),
(197,'',0,'2025-11-27 11:57:58.432751',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: ',NULL,0,'WRONG_ANSWER',197),
(198,'',0,'2025-11-27 11:58:24.310691',0,'오답입니다. 입력: 3 3 5\nO..\n.O.\n..O, 예상: O..\n.O.\n..O, 실제: ...\n...\n...',NULL,0,'WRONG_ANSWER',198),
(199,'',0,'2025-11-27 12:01:47.881321',0,'오답입니다. 입력: 3 3 5\n.O.\nOOO\n.O., 예상: OOO\nOOO\nOOO, 실제: .O.\nOOO\n.O.',NULL,0,'WRONG_ANSWER',199),
(200,'',0,'2025-11-27 12:28:51.207144',0,'오답입니다. 입력: 3 3 5\nO..\n.O.\n..O, 예상: O..\n.O.\n..O, 실제: ...\n...\n...',NULL,0,'WRONG_ANSWER',200),
(201,NULL,0,'2025-11-27 12:28:55.797416',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',15,'ACCEPTED',201),
(202,'/tmp/nimda-judge/TEAM1_1_202/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_202/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_202/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:46:53.008717',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',202),
(203,'',0,'2025-12-06 15:48:29.786601',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',203),
(204,'',0,'2025-12-06 15:48:49.327161',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',204),
(205,'',0,'2025-12-06 15:49:09.656575',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',205),
(206,'/tmp/nimda-judge/TEAM1_1_206/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_206/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_206/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:49:29.581022',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',206),
(207,'',0,'2025-12-06 15:49:40.075434',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',207),
(208,'',0,'2025-12-06 15:49:50.566285',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',208),
(209,'',0,'2025-12-06 15:50:01.118413',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',209),
(210,'',0,'2025-12-06 15:50:11.363389',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',210),
(211,'',0,'2025-12-06 15:50:22.949678',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',211),
(212,'/tmp/nimda-judge/TEAM1_1_212/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_212/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_212/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:50:33.443442',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',212),
(213,'',0,'2025-12-06 15:50:37.730817',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',213),
(214,'',0,'2025-12-06 15:50:42.093397',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',214),
(215,'',0,'2025-12-06 15:50:46.334509',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',215),
(216,'/tmp/nimda-judge/TEAM1_1_216/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_216/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_216/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:50:50.397877',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',216),
(217,'',0,'2025-12-06 15:50:54.724367',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',217),
(218,'/tmp/nimda-judge/TEAM1_1_218/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_218/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_218/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:50:59.182200',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',218),
(219,'',0,'2025-12-06 15:51:03.317750',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',219),
(220,'',0,'2025-12-06 15:51:07.285055',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',220),
(221,'',0,'2025-12-06 15:51:11.867997',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',221),
(222,'/tmp/nimda-judge/TEAM1_1_222/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_222/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_222/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:51:16.061976',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',222),
(223,'',0,'2025-12-06 15:51:20.235239',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',223),
(224,'',0,'2025-12-06 15:51:24.758491',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',224),
(225,'',0,'2025-12-06 15:51:28.982343',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',225),
(226,'/tmp/nimda-judge/TEAM1_1_226/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_226/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_226/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:51:32.838698',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',226),
(227,'',0,'2025-12-06 15:51:35.367685',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',227),
(228,'',0,'2025-12-06 15:51:38.112694',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',228),
(229,'',0,'2025-12-06 15:51:40.629967',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',229),
(230,'',0,'2025-12-06 15:51:43.122300',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',230),
(231,'',0,'2025-12-06 15:51:45.910201',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',231),
(232,'',0,'2025-12-06 15:51:48.465088',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',232),
(233,'/tmp/nimda-judge/TEAM1_1_233/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_233/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_233/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:51:50.943791',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',233),
(234,'',0,'2025-12-06 15:51:53.519536',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',234),
(235,'/tmp/nimda-judge/TEAM1_1_235/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_235/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_235/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:51:55.941114',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',235),
(236,'',0,'2025-12-06 15:51:58.607124',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',236),
(237,'',0,'2025-12-06 15:52:01.196891',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',237),
(238,'',0,'2025-12-06 15:52:03.875564',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',238),
(239,'',0,'2025-12-06 15:52:06.714199',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',239),
(240,'/tmp/nimda-judge/TEAM1_1_240/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_240/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_240/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:52:09.135930',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',240),
(241,'',0,'2025-12-06 15:52:11.799069',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',241),
(242,'',0,'2025-12-06 15:52:14.462048',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',242),
(243,'',0,'2025-12-06 15:52:17.198921',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',243),
(244,'',0,'2025-12-06 15:52:19.787327',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',244),
(245,'/tmp/nimda-judge/TEAM1_1_245/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_245/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_245/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:52:22.290310',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',245),
(246,'/tmp/nimda-judge/TEAM1_1_246/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_246/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_246/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:52:24.968678',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',246),
(247,'',0,'2025-12-06 15:52:27.496780',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',247),
(248,'',0,'2025-12-06 15:52:30.163605',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',248),
(249,'',0,'2025-12-06 15:52:32.477370',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',249),
(250,'',0,'2025-12-06 15:52:34.575455',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',250),
(251,'',0,'2025-12-06 15:52:36.644777',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',251),
(252,'',0,'2025-12-06 15:52:38.824025',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',252),
(253,'',0,'2025-12-06 15:52:40.993951',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',253),
(254,'',0,'2025-12-06 15:52:43.194754',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',254),
(255,'',0,'2025-12-06 15:52:45.494179',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',255),
(256,'',0,'2025-12-06 15:52:47.524568',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',256),
(257,'/tmp/nimda-judge/TEAM1_1_257/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_257/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_257/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:52:49.625335',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',257),
(258,'',0,'2025-12-06 15:52:51.980274',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',258),
(259,'/tmp/nimda-judge/TEAM1_1_259/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_259/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_259/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:52:54.961226',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',259),
(260,'',0,'2025-12-06 15:52:58.154819',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',260),
(261,'',0,'2025-12-06 15:53:00.368845',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',261),
(262,'',0,'2025-12-06 15:53:02.872644',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',262),
(263,'',0,'2025-12-06 15:53:05.250706',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',263),
(264,'',0,'2025-12-06 15:53:07.742711',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',264),
(265,'',0,'2025-12-06 15:53:10.699687',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',265),
(266,'',0,'2025-12-06 15:53:13.075021',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',266),
(267,'',0,'2025-12-06 15:53:15.822021',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',267),
(268,'',0,'2025-12-06 15:53:18.467679',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',268),
(269,'/tmp/nimda-judge/TEAM1_1_269/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_269/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_269/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:53:20.836828',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',269),
(270,'',0,'2025-12-06 15:53:23.485497',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',270),
(271,'',0,'2025-12-06 15:53:25.918793',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',271),
(272,'',0,'2025-12-06 15:53:27.996205',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',272),
(273,'',0,'2025-12-06 15:53:30.146323',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',273),
(274,'',0,'2025-12-06 15:53:32.321514',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',274),
(275,'',0,'2025-12-06 15:53:34.457290',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',275),
(276,'/tmp/nimda-judge/TEAM1_1_276/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_276/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_276/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:53:36.598826',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',276),
(277,'/tmp/nimda-judge/TEAM1_1_277/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_277/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_277/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:53:38.585986',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',277),
(278,'',0,'2025-12-06 15:53:40.845740',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',278),
(279,'',0,'2025-12-06 15:53:43.005845',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',279),
(280,'',0,'2025-12-06 15:53:45.036050',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',280),
(281,'',0,'2025-12-06 15:53:47.275881',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',281),
(282,'',0,'2025-12-06 15:53:49.712135',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',282),
(283,'',0,'2025-12-06 15:53:52.027945',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',283),
(284,'',0,'2025-12-06 15:53:54.203782',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',284),
(285,'',0,'2025-12-06 15:53:56.420006',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',285),
(286,'',0,'2025-12-06 15:53:58.642229',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',286),
(287,'',0,'2025-12-06 15:54:01.004956',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',287),
(288,'',0,'2025-12-06 15:54:03.197151',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',288),
(289,'/tmp/nimda-judge/TEAM1_1_289/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_289/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_289/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:54:05.217709',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',289),
(290,'',0,'2025-12-06 15:54:07.455020',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',290),
(291,'',0,'2025-12-06 15:54:09.739748',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',291),
(292,'',0,'2025-12-06 15:54:12.022845',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',292),
(293,'',0,'2025-12-06 15:54:14.152144',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',293),
(294,'',0,'2025-12-06 15:54:16.320548',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',294),
(295,'',0,'2025-12-06 15:54:18.506561',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',295),
(296,'',0,'2025-12-06 15:54:20.552954',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',296),
(297,'',0,'2025-12-06 15:54:22.833120',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',297),
(298,'/tmp/nimda-judge/TEAM1_1_298/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_298/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_298/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:54:24.941705',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',298),
(299,'',0,'2025-12-06 15:54:27.136794',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',299),
(300,'',0,'2025-12-06 15:54:29.313135',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',300),
(301,'',0,'2025-12-06 15:54:31.513802',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',301),
(302,'',0,'2025-12-06 15:54:33.743911',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',302),
(303,'/tmp/nimda-judge/TEAM1_1_303/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_303/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_303/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:54:35.714132',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',303),
(304,'/tmp/nimda-judge/TEAM1_1_304/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_304/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_304/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:54:37.817191',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',304),
(305,'',0,'2025-12-06 15:54:40.118966',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',305),
(306,'/tmp/nimda-judge/TEAM1_1_306/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_306/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_306/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:54:42.175547',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',306),
(307,'',0,'2025-12-06 15:54:44.323041',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',307),
(308,'',0,'2025-12-06 15:54:46.520072',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',308),
(309,'',0,'2025-12-06 15:54:48.709188',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',309),
(310,'',0,'2025-12-06 15:54:50.786761',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',310),
(311,'',0,'2025-12-06 15:54:52.831985',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',311),
(312,'',0,'2025-12-06 15:54:54.959289',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',312),
(313,'',0,'2025-12-06 15:54:57.034909',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',313),
(314,'',0,'2025-12-06 15:54:59.190955',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',314),
(315,'',0,'2025-12-06 15:55:01.440655',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',315),
(316,'',0,'2025-12-06 15:55:03.615755',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',316),
(317,'',0,'2025-12-06 15:55:05.761799',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',317),
(318,'',0,'2025-12-06 15:55:08.042512',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',318),
(319,'',0,'2025-12-06 15:55:10.988597',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',319),
(320,'/tmp/nimda-judge/TEAM1_1_320/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_320/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_320/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:55:13.781160',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',320),
(321,'',0,'2025-12-06 15:55:15.866582',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',321),
(322,'',0,'2025-12-06 15:55:17.921243',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',322),
(323,'',0,'2025-12-06 15:55:19.998100',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98298',NULL,0,'WRONG_ANSWER',323),
(324,'',0,'2025-12-06 15:55:22.185437',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98301',NULL,0,'WRONG_ANSWER',324),
(325,'/tmp/nimda-judge/TEAM1_1_325/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_325/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_325/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:55:24.201749',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',325),
(326,'',0,'2025-12-06 15:55:26.393145',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',326),
(327,'',0,'2025-12-06 15:55:28.578320',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',327),
(328,'',0,'2025-12-06 15:55:30.713731',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',328),
(329,'',0,'2025-12-06 15:55:32.651578',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',329),
(330,'',0,'2025-12-06 15:55:34.451038',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',330),
(331,'',0,'2025-12-06 15:55:36.502150',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',331),
(332,'',0,'2025-12-06 15:55:38.368685',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',332),
(333,'',0,'2025-12-06 15:55:40.232916',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',333),
(334,'',0,'2025-12-06 15:55:42.198042',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',334),
(335,'',0,'2025-12-06 15:55:44.009675',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',335),
(336,'',0,'2025-12-06 15:55:45.869294',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',336),
(337,'',0,'2025-12-06 15:55:47.683301',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',337),
(338,'/tmp/nimda-judge/TEAM1_1_338/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_338/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_338/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:55:50.823916',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',338),
(339,'',0,'2025-12-06 15:55:53.745853',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',339),
(340,'',0,'2025-12-06 15:55:56.144484',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',340),
(341,'',0,'2025-12-06 15:55:58.378115',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',341),
(342,'',0,'2025-12-06 15:56:01.694673',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',342),
(343,'',0,'2025-12-06 15:56:04.192784',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',343),
(344,'',0,'2025-12-06 15:56:06.890038',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',344),
(345,'',0,'2025-12-06 15:56:09.443269',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',345),
(346,'',0,'2025-12-06 15:56:11.776050',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',346),
(347,'/tmp/nimda-judge/TEAM1_1_347/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_347/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_347/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:14.043379',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',347),
(348,'',0,'2025-12-06 15:56:16.552453',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',348),
(349,'/tmp/nimda-judge/TEAM1_1_349/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_349/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_349/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:18.560209',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',349),
(350,'',0,'2025-12-06 15:56:21.063461',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',350),
(351,'',0,'2025-12-06 15:56:23.087111',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',351),
(352,'',0,'2025-12-06 15:56:25.053750',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',352),
(353,'',0,'2025-12-06 15:56:27.017460',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',353),
(354,'',0,'2025-12-06 15:56:29.090509',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',354),
(355,'',0,'2025-12-06 15:56:31.108113',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',355),
(356,'/tmp/nimda-judge/TEAM1_1_356/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_356/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_356/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:32.926639',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',356),
(357,'',0,'2025-12-06 15:56:34.872311',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',357),
(358,'',0,'2025-12-06 15:56:36.804318',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',358),
(359,'/tmp/nimda-judge/TEAM1_1_359/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_359/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_359/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:38.750299',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',359),
(360,'',0,'2025-12-06 15:56:40.708107',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',360),
(361,'',0,'2025-12-06 15:56:42.814808',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',361),
(362,'/tmp/nimda-judge/TEAM1_1_362/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_362/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_362/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:44.776990',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',362),
(363,'',0,'2025-12-06 15:56:46.737339',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',363),
(364,'/tmp/nimda-judge/TEAM1_1_364/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_364/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_364/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:49.058230',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',364),
(365,'/tmp/nimda-judge/TEAM1_1_365/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_365/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_365/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:50.913285',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',365),
(366,'',0,'2025-12-06 15:56:52.867963',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',366),
(367,'',0,'2025-12-06 15:56:55.181014',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98295',NULL,0,'WRONG_ANSWER',367),
(368,'/tmp/nimda-judge/TEAM1_1_368/solution.cpp: In function ‘int main()’:\n/tmp/nimda-judge/TEAM1_1_368/solution.cpp:5:5: error: expected initializer before ‘cin’\n    5 |     cin >> a >> b;  // 세미콜론 누락\n      |     ^~~\n/tmp/nimda-judge/TEAM1_1_368/solution.cpp:6:17: error: ‘b’ was not declared in this scope\n    6 |     cout << a + b << endl;\n      |                 ^\n',0,'2025-12-06 15:56:57.060476',0,'컴파일 에러',NULL,0,'COMPILATION_ERROR',368),
(369,'',0,'2025-12-06 15:56:59.037948',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 98292',NULL,0,'WRONG_ANSWER',369),
(370,'',0,'2025-12-06 16:19:26.096120',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',370),
(371,'',0,'2025-12-06 16:19:28.686179',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',371),
(372,'',0,'2025-12-06 16:19:31.291099',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',372),
(373,'',0,'2025-12-06 16:19:33.809837',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',373),
(374,'',0,'2025-12-06 16:19:36.333378',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',374),
(375,'',0,'2025-12-06 16:19:38.833637',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',375),
(376,'',0,'2025-12-06 16:19:41.423536',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',376),
(377,'',0,'2025-12-06 16:19:44.168014',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',377),
(378,'',0,'2025-12-06 16:19:46.830507',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',378),
(379,'',0,'2025-12-06 16:19:49.568096',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',379),
(380,'',0,'2025-12-06 16:19:52.144767',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',380),
(381,'',0,'2025-12-06 16:19:54.633250',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',381),
(382,'',0,'2025-12-06 16:19:57.104768',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',382),
(383,'',0,'2025-12-06 16:19:59.738036',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',383),
(384,'',0,'2025-12-06 16:20:03.235837',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',384),
(385,'',0,'2025-12-06 16:20:05.916788',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',385),
(386,'',0,'2025-12-06 16:20:08.562399',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',386),
(387,'',0,'2025-12-06 16:20:11.142798',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',387),
(388,'',0,'2025-12-06 16:20:13.930041',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',388),
(389,'',0,'2025-12-06 16:20:16.710536',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',389),
(390,'',0,'2025-12-06 16:20:19.593767',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',390),
(391,'',0,'2025-12-06 16:20:22.086742',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',391),
(392,'',0,'2025-12-06 16:20:24.807424',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',392),
(393,'',0,'2025-12-06 16:20:27.472946',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',393),
(394,'',0,'2025-12-06 16:20:29.742046',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',394),
(395,'',0,'2025-12-06 16:20:32.044776',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',395),
(396,'',0,'2025-12-06 16:20:34.369723',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',396),
(397,'',0,'2025-12-06 16:20:36.659445',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',397),
(398,'',0,'2025-12-06 16:20:39.057544',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',398),
(399,'',0,'2025-12-06 16:20:41.325622',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',399),
(400,'',0,'2025-12-06 16:20:43.675258',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',400),
(401,'',0,'2025-12-06 16:20:46.117104',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',401),
(402,'',0,'2025-12-06 16:20:48.509811',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',402),
(403,'',0,'2025-12-06 16:20:50.741089',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',403),
(404,'',0,'2025-12-06 16:20:52.928808',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',404),
(405,'',0,'2025-12-06 16:20:55.286142',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',405),
(406,'',0,'2025-12-06 16:20:57.634388',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',406),
(407,'',0,'2025-12-06 16:20:59.846448',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',407),
(408,'',0,'2025-12-06 16:21:02.820124',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',408),
(409,'',0,'2025-12-06 16:21:05.149424',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',409),
(410,'',0,'2025-12-06 16:21:07.414801',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',410),
(411,'',0,'2025-12-06 16:21:09.667110',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',411),
(412,'',0,'2025-12-06 16:21:12.028487',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',412),
(413,'',0,'2025-12-06 16:21:14.486302',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',413),
(414,'',0,'2025-12-06 16:21:16.741608',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',414),
(415,'',0,'2025-12-06 16:21:19.080254',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',415),
(416,'',0,'2025-12-06 16:21:21.475399',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',416),
(417,'',0,'2025-12-06 16:21:23.735168',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',417),
(418,'',0,'2025-12-06 16:21:26.003315',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',418),
(419,'',0,'2025-12-06 16:21:28.309988',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',419),
(420,'',0,'2025-12-06 16:21:30.706513',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',420),
(421,'',0,'2025-12-06 16:21:32.921931',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',421),
(422,'',0,'2025-12-06 16:21:35.302506',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',422),
(423,'',0,'2025-12-06 16:21:37.712141',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',423),
(424,'',0,'2025-12-06 16:21:40.065072',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',424),
(425,'',0,'2025-12-06 16:21:42.259800',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',425),
(426,'',0,'2025-12-06 16:21:44.759440',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',426),
(427,'',0,'2025-12-06 16:21:47.014576',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',427),
(428,'',0,'2025-12-06 16:21:49.420340',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',428),
(429,'',0,'2025-12-06 16:21:51.604749',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',429),
(430,'',0,'2025-12-06 16:21:53.834645',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',430),
(431,'',0,'2025-12-06 16:21:56.028568',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',431),
(432,'',0,'2025-12-06 16:21:58.430552',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',432),
(433,'',0,'2025-12-06 16:22:00.914779',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',433),
(434,'',0,'2025-12-06 16:22:03.194114',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',434),
(435,'',0,'2025-12-06 16:22:05.623311',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',435),
(436,'',0,'2025-12-06 16:22:07.970816',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',436),
(437,'',0,'2025-12-06 16:22:10.310656',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',437),
(438,'',0,'2025-12-06 16:22:12.726074',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',438),
(439,'',0,'2025-12-06 16:22:14.974966',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',439),
(440,'',0,'2025-12-06 16:22:17.249579',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',440),
(441,'',0,'2025-12-06 16:22:19.624255',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',441),
(442,'',0,'2025-12-06 16:22:22.025404',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',442),
(443,'',0,'2025-12-06 16:22:24.469440',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',443),
(444,'',0,'2025-12-06 16:22:26.793435',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',444),
(445,'',0,'2025-12-06 16:22:29.220776',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',445),
(446,'',0,'2025-12-06 16:22:31.608910',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',446),
(447,'',0,'2025-12-06 16:22:34.040253',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',447),
(448,'',0,'2025-12-06 16:22:36.432211',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',448),
(449,'',0,'2025-12-06 16:22:38.683392',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',449),
(450,'',0,'2025-12-06 16:22:40.990491',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',450),
(451,'',0,'2025-12-06 16:22:43.430425',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',451),
(452,'',0,'2025-12-06 16:22:45.771462',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',452),
(453,'',0,'2025-12-06 16:22:48.267311',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',453),
(454,'',0,'2025-12-06 16:22:50.639960',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',454),
(455,'',0,'2025-12-06 16:22:53.009276',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',455),
(456,'',0,'2025-12-06 16:22:55.305986',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',456),
(457,'',0,'2025-12-06 16:22:57.564365',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',457),
(458,'',0,'2025-12-06 16:23:00.384119',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',458),
(459,'',0,'2025-12-06 16:23:02.829825',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',459),
(460,'',0,'2025-12-06 16:23:05.225104',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',460),
(461,'',0,'2025-12-06 16:23:07.464992',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',461),
(462,'',0,'2025-12-06 16:23:09.811699',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',462),
(463,'',0,'2025-12-06 16:23:12.156218',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',463),
(464,'',0,'2025-12-06 16:23:14.665899',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',464),
(465,'',0,'2025-12-06 16:23:17.011194',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',465),
(466,'',0,'2025-12-06 16:23:19.500962',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',466),
(467,'',0,'2025-12-06 16:23:21.877975',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',467),
(468,'',0,'2025-12-06 16:23:24.263036',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',468),
(469,'',0,'2025-12-06 16:23:26.621311',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',469),
(470,'',0,'2025-12-06 16:23:28.954352',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',470),
(471,'',0,'2025-12-06 16:23:31.037200',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',471),
(472,'',0,'2025-12-06 16:23:33.475301',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',472),
(473,'',0,'2025-12-06 16:23:35.847827',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',473),
(474,'',0,'2025-12-06 16:23:38.037852',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',474),
(475,'',0,'2025-12-06 16:23:40.235277',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',475),
(476,'',0,'2025-12-06 16:23:42.446295',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',476),
(477,'',0,'2025-12-06 16:23:44.821451',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',477),
(478,'',0,'2025-12-06 16:23:47.094924',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',478),
(479,'',0,'2025-12-06 16:23:49.504904',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',479),
(480,'',0,'2025-12-06 16:23:51.751167',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',480),
(481,'',0,'2025-12-06 16:23:53.986198',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',481),
(482,'',0,'2025-12-06 16:23:56.158026',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',482),
(483,'',0,'2025-12-06 16:23:58.499644',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',483),
(484,'',0,'2025-12-06 16:24:01.018163',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',484),
(485,'',0,'2025-12-06 16:24:03.323486',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',485),
(486,'',0,'2025-12-06 16:24:05.479117',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',486),
(487,'',0,'2025-12-06 16:24:07.858000',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',487),
(488,'',0,'2025-12-06 16:24:10.075755',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',488),
(489,'',0,'2025-12-06 16:24:12.387798',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',489),
(490,'',0,'2025-12-06 16:24:14.742347',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',490),
(491,'',0,'2025-12-06 16:24:17.109993',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',491),
(492,'',0,'2025-12-06 16:24:19.529003',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',492),
(493,'',0,'2025-12-06 16:24:21.758941',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',493),
(494,'',0,'2025-12-06 16:24:24.034212',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',494),
(495,'',0,'2025-12-06 16:24:26.263228',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',495),
(496,'',0,'2025-12-06 16:24:28.505195',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',496),
(497,'',0,'2025-12-06 16:24:30.901617',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',497),
(498,'',0,'2025-12-06 16:24:33.169012',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',498),
(499,'',0,'2025-12-06 16:24:35.429582',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',499),
(500,'',0,'2025-12-06 16:24:37.750299',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',500),
(501,'',0,'2025-12-06 16:24:40.128319',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',501),
(502,'',0,'2025-12-06 16:24:42.310425',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',502),
(503,'',0,'2025-12-06 16:24:44.619730',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',503),
(504,'',0,'2025-12-06 16:24:46.804848',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',504),
(505,'',0,'2025-12-06 16:24:49.059636',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',505),
(506,'',0,'2025-12-06 16:24:51.275440',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',506),
(507,'',0,'2025-12-06 16:24:53.496492',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',507),
(508,'',0,'2025-12-06 16:24:55.745088',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',508),
(509,'',0,'2025-12-06 16:24:57.886822',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',509),
(510,'',0,'2025-12-06 16:25:00.146129',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',510),
(511,'',0,'2025-12-06 16:25:02.752340',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',511),
(512,'',0,'2025-12-06 16:25:05.026524',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',512),
(513,'',0,'2025-12-06 16:25:07.351978',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',513),
(514,'',0,'2025-12-06 16:25:09.590044',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',514),
(515,'',0,'2025-12-06 16:25:11.843413',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',515),
(516,'',0,'2025-12-06 16:25:14.200497',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',516),
(517,'',0,'2025-12-06 16:25:16.484543',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',517),
(518,'',0,'2025-12-06 16:25:18.670481',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',518),
(519,'',0,'2025-12-06 16:25:20.948189',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',519),
(520,'',0,'2025-12-06 16:25:23.192107',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',520),
(521,'',0,'2025-12-06 16:25:25.372008',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',521),
(522,'',0,'2025-12-06 16:25:27.526192',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',522),
(523,'',0,'2025-12-06 16:25:29.734579',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',523),
(524,'',0,'2025-12-06 16:25:32.082956',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',524),
(525,'',0,'2025-12-06 16:25:34.399542',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',525),
(526,'',0,'2025-12-06 16:25:36.538716',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',526),
(527,'',0,'2025-12-06 16:25:38.690441',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',527),
(528,'',0,'2025-12-06 16:25:40.898054',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',528),
(529,'',0,'2025-12-06 16:25:43.023840',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',529),
(530,'',0,'2025-12-06 16:25:45.199322',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',530),
(531,'',0,'2025-12-06 16:25:47.327060',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',531),
(532,'',0,'2025-12-06 16:25:49.550044',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',532),
(533,'',0,'2025-12-06 16:25:51.818468',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',533),
(534,'',0,'2025-12-06 16:25:54.043000',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',534),
(535,'',0,'2025-12-06 16:25:56.304537',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',535),
(536,'',0,'2025-12-06 16:25:58.657727',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',536),
(537,'',0,'2025-12-06 16:26:01.186769',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',537),
(538,'',0,'2025-12-06 16:26:03.709056',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',538),
(539,'',0,'2025-12-06 16:26:05.965952',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',539),
(540,'',0,'2025-12-06 16:26:08.161325',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',540),
(541,'',0,'2025-12-06 16:26:10.371479',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',541),
(542,'',0,'2025-12-06 16:26:12.599055',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',542),
(543,'',0,'2025-12-06 16:26:15.063942',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',543),
(544,'',0,'2025-12-06 16:26:17.231715',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',544),
(545,'',0,'2025-12-06 16:26:19.476954',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',545),
(546,'',0,'2025-12-06 16:26:21.695957',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',546),
(547,'',0,'2025-12-06 16:26:23.907046',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',547),
(548,'',0,'2025-12-06 16:26:26.133057',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',548),
(549,'',0,'2025-12-06 16:26:28.272415',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',549),
(550,'',0,'2025-12-06 16:26:30.449194',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',550),
(551,'',0,'2025-12-06 16:26:32.654612',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',551),
(552,'',0,'2025-12-06 16:26:34.743259',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',552),
(553,'',0,'2025-12-06 16:26:36.896297',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',553),
(554,'',0,'2025-12-06 16:26:39.078552',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',554),
(555,'',0,'2025-12-06 16:26:41.209746',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',555),
(556,'',0,'2025-12-06 16:26:43.371573',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',556),
(557,'',0,'2025-12-06 16:26:45.568583',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',557),
(558,'',0,'2025-12-06 16:26:47.781970',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',558),
(559,'',0,'2025-12-06 16:26:50.012910',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',559),
(560,'',0,'2025-12-06 16:26:52.261290',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',560),
(561,'',0,'2025-12-06 16:26:54.456736',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',561),
(562,'',0,'2025-12-06 16:26:56.690266',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',562),
(563,'',0,'2025-12-06 16:26:58.911842',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',563),
(564,'',0,'2025-12-06 16:27:01.294385',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',564),
(565,'',0,'2025-12-06 16:27:03.578455',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',565),
(566,'',0,'2025-12-06 16:27:05.798814',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',566),
(567,'',0,'2025-12-06 16:27:08.020543',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',567),
(568,'',0,'2025-12-06 16:27:10.207790',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',568),
(569,'',0,'2025-12-06 16:27:12.419685',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',569),
(570,'',0,'2025-12-06 16:27:14.718127',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',570),
(571,'',0,'2025-12-06 16:27:16.960268',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',571),
(572,'',0,'2025-12-06 16:27:19.244538',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',572),
(573,'',0,'2025-12-06 16:27:21.448659',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',573),
(574,'',0,'2025-12-06 16:27:23.737099',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',574),
(575,'',0,'2025-12-06 16:27:25.974118',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',575),
(576,'',0,'2025-12-06 16:27:28.127799',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',576),
(577,'',0,'2025-12-06 16:27:30.321193',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',577),
(578,'',0,'2025-12-06 16:27:32.494830',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',578),
(579,'',0,'2025-12-06 16:27:34.697214',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',579),
(580,'',0,'2025-12-06 16:27:37.004377',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',580),
(581,'',0,'2025-12-06 16:27:39.312908',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',581),
(582,'',0,'2025-12-06 16:27:41.538611',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',582),
(583,'',0,'2025-12-06 16:27:43.706603',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',583),
(584,'',0,'2025-12-06 16:27:45.877705',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',584),
(585,'',0,'2025-12-06 16:27:48.110537',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',585),
(586,'',0,'2025-12-06 16:27:50.371504',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',586),
(587,'',0,'2025-12-06 16:27:52.589166',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',587),
(588,'',0,'2025-12-06 16:27:54.859842',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',588),
(589,'',0,'2025-12-06 16:27:57.226706',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',589),
(590,'',0,'2025-12-06 16:27:59.794499',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',590),
(591,'',0,'2025-12-06 16:28:02.564494',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',591),
(592,'',0,'2025-12-06 16:28:04.891243',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',592),
(593,'',0,'2025-12-06 16:28:07.157817',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',593),
(594,'',0,'2025-12-06 16:28:09.471046',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',594),
(595,'',0,'2025-12-06 16:28:11.850868',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',595),
(596,'',0,'2025-12-06 16:28:14.301401',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',596),
(597,'',0,'2025-12-06 16:28:16.667527',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',597),
(598,'',0,'2025-12-06 16:28:18.961770',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',598),
(599,'',0,'2025-12-06 16:28:21.297944',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',599),
(600,'',0,'2025-12-06 16:28:23.602660',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',600),
(601,'',0,'2025-12-06 16:28:25.800191',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',601),
(602,'',0,'2025-12-06 16:28:28.033422',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',602),
(603,'',0,'2025-12-06 16:28:30.430786',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',603),
(604,'',0,'2025-12-06 16:28:32.701203',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',604),
(605,'',0,'2025-12-06 16:28:34.905938',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',605),
(606,'',0,'2025-12-06 16:28:37.174294',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',606),
(607,'',0,'2025-12-06 16:28:39.425410',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',607),
(608,'',0,'2025-12-06 16:28:41.810647',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',608),
(609,'',0,'2025-12-06 16:28:44.108840',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',609),
(610,'',0,'2025-12-06 16:28:46.356822',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',610),
(611,'',0,'2025-12-06 16:28:48.588938',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',611),
(612,'',0,'2025-12-06 16:28:50.989396',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',612),
(613,'',0,'2025-12-06 16:28:53.212553',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',613),
(614,'',0,'2025-12-06 16:28:55.483806',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',614),
(615,'',0,'2025-12-06 16:28:57.736954',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',615),
(616,'',0,'2025-12-06 16:29:00.076239',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',616),
(617,'',0,'2025-12-06 16:29:02.657424',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',617),
(618,'',0,'2025-12-06 16:29:04.942383',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',618),
(619,'',0,'2025-12-06 16:29:07.233047',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',619),
(620,'',0,'2025-12-06 16:29:09.742658',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',620),
(621,'',0,'2025-12-06 16:29:12.112249',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',621),
(622,'',0,'2025-12-06 16:29:14.420680',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',622),
(623,'',0,'2025-12-06 16:29:16.809737',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',623),
(624,'',0,'2025-12-06 16:29:19.067745',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',624),
(625,'',0,'2025-12-06 16:29:21.324083',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',625),
(626,'',0,'2025-12-06 16:29:23.667621',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',626),
(627,'',0,'2025-12-06 16:29:26.255137',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',627),
(628,'',0,'2025-12-06 16:29:28.776383',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',628),
(629,'',0,'2025-12-06 16:29:31.096234',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',629),
(630,'',0,'2025-12-06 16:29:33.448573',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',630),
(631,'',0,'2025-12-06 16:29:35.902704',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',631),
(632,'',0,'2025-12-06 16:29:38.176705',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',632),
(633,'',0,'2025-12-06 16:29:40.455040',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',633),
(634,'',0,'2025-12-06 16:29:42.927014',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',634),
(635,'',0,'2025-12-06 16:29:45.311105',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',635),
(636,'',0,'2025-12-06 16:29:47.670109',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',636),
(637,'',0,'2025-12-06 16:29:49.949510',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',637),
(638,'',0,'2025-12-06 16:29:52.303765',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',638),
(639,'',0,'2025-12-06 16:29:54.631715',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',639),
(640,'',0,'2025-12-06 16:29:57.055207',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',640),
(641,'',0,'2025-12-06 16:29:59.426213',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',641),
(642,'',0,'2025-12-06 16:30:03.111354',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',642),
(643,'',0,'2025-12-06 16:30:05.523581',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',643),
(644,'',0,'2025-12-06 16:30:07.984686',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',644),
(645,'',0,'2025-12-06 16:30:10.381454',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',645),
(646,'',0,'2025-12-06 16:30:12.745758',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',646),
(647,'',0,'2025-12-06 16:30:15.314784',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',647),
(648,'',0,'2025-12-06 16:30:17.762788',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',648),
(649,'',0,'2025-12-06 16:30:20.193194',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',649),
(650,'',0,'2025-12-06 16:30:22.542940',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',650),
(651,'',0,'2025-12-06 16:30:24.993051',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',651),
(652,'',0,'2025-12-06 16:30:27.339988',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',652),
(653,'',0,'2025-12-06 16:30:30.306607',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32770',NULL,0,'WRONG_ANSWER',653),
(654,'',0,'2025-12-06 16:30:33.258018',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',654),
(655,'',0,'2025-12-06 16:30:36.155975',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',655),
(656,'',0,'2025-12-06 16:30:39.113061',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',656),
(657,'',0,'2025-12-06 16:30:41.940639',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',657),
(658,'',0,'2025-12-06 16:30:45.037633',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32769',NULL,0,'WRONG_ANSWER',658),
(659,'',0,'2025-12-06 16:30:48.134002',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32767',NULL,0,'WRONG_ANSWER',659),
(660,'',0,'2025-12-06 16:30:51.147395',0,'오답입니다. 입력: 10 10, 예상: 9 25, 실제: Hello World',NULL,0,'WRONG_ANSWER',660),
(661,'',0,'2025-12-06 16:30:54.191704',0,'오답입니다. 입력: 3, 예상: \"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\", 실제: 32768',NULL,0,'WRONG_ANSWER',661),
(662,NULL,0,'2025-12-16 01:50:26.379311',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',662),
(663,NULL,0,'2025-12-16 02:21:28.081476',0,'채점이 완료되었습니다.','모든 테스트케이스를 통과했습니다!',5,'ACCEPTED',663);
/*!40000 ALTER TABLE `judge_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD','EXPERT') DEFAULT NULL,
  `language` varchar(50) DEFAULT NULL,
  `memory_limit` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `time_limit` int DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `input_format` text,
  `output_format` text,
  `group_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6fb49uuc3jn2k9de4umj1v151` (`group_id`),
  CONSTRAINT `FK6fb49uuc3jn2k9de4umj1v151` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problems`
--

LOCK TABLES `problems` WRITE;
/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
INSERT INTO `problems` VALUES
(1,'2025-11-20 11:04:26.231642','은솔이는 올해 처음으로 동아리에 들어왔다. 선배들에게 강렬한 첫인상을 남기고 싶었던 은솔이는 특별하게 코드로 인사를 전하기로 결심했다. 은솔이가 무사히 인사할 수 있도록 코드 작성을 도와주자. **bold**','EASY',NULL,128,5,1,'Hello NIMDA! ','2025-11-26 12:15:49.537525','첫째 줄에 인사해야 할 선배의 수 N이 주어진다. (1 ≤ N ≤ 100) ','선배의 수만큼 줄을 바꾸며 “Hello, NIMDA!”를 출력하시오. 특수문자까지 출력해야 한다는 점에 유의하자.',NULL),
(2,'2025-11-24 05:16:29.452616','서윤이는 매일 아침 알람을 듣고 일어난다.\n…라고 말하고 싶지만 사실 알람을 들어도 안 일어난다.\n왜냐하면 알람이 울리면 기가 막히게 “5분만…” 버튼을 누르는 천재이기 때문이다.\n덕분에 지각도 천재처럼 자주 한다.\n\n이 모습을 안타깝게 지켜보던 도일이는 자신만의 비법을 전수해 준다.\n바로 “알람을 45분 당겨놓기” 전략이다.\n\n원리는 매우 간단하다.\n어차피 서윤이는 알람을 끄고 다시 잘 것이기 때문에,\n애초에 45분 일찍 울리게 만들어 놓으면…\n결과적으로 정시에 일어난 것 같은 착각을 주면서 실제로는 지각을 막아주는 고급 기술이다.\n\n현재 서윤이가 설정해둔 알람 시각이 주어질 때,\n도일이의 위대한(?) 방법을 적용하면 알람을 몇 시로 설정해야 하는지 구하는 프로그램을 작성하시오.','EASY',NULL,128,5,1,'지각왕 김서윤','2025-11-24 05:17:24.035414','첫째 줄에 두 정수 H와 M이 주어진다. (0 ≤ H ≤ 23, 0 ≤ M ≤ 59) 그리고 이것은 현재 서윤이가 설정한 알람 시간 H시 M분을 의미한다.\n\n입력 시간은 24시간 표현을 사용한다. 24시간 표현에서 하루의 시작은 0:0(자정)이고, 끝은 23:59(다음날 자정 1분 전)이다. 시간을 나타낼 때, 불필요한 0은 사용하지 않는다.','첫째 줄에 서윤이가 도일이의 방법을 사용할 때, 설정해야 하는 알람 시간을 출력한다. (입력과 같은 형태로 출력하면 된다.)',NULL),
(3,'2025-11-24 05:25:40.721032','근래 동아리 내에서 유행하는 게임인 블랙잭은 카드의 합이 21을 넘지 않는 한도 내에서, 카드의 합을 최대한 크게 만드는 게임이다.\n\n동아리 내 최고의 블랙잭 킹갓제너럴고수인 도현이는 새로운 블랙잭 규칙을 만들어 유찬, 명건이와 같이 게임하려 한다.\n\n이도현 버전의 블랙잭에서 각 카드에는 양의 정수가 쓰여 있다. \n그 다음, 사회자는 N장의 카드를 모두 숫자가 보이도록 바닥에 놓는다. \n그런 후에 사회자는 숫자 M을 크게 외친다.\n\n이제 플레이어는 제한된 시간 안에 N장의 카드 중에서 3장의 카드를 골라야 한다. \n블랙잭 변형 게임이기 때문에, 플레이어가 고른 카드의 합은 M을 넘지 않으면서 M과 최대한 가깝게 만들어야 한다.\n\nN장의 카드에 써져 있는 숫자가 주어졌을 때, M을 넘지 않으면서 M에 최대한 가까운 카드 3장의 합을 구해 출력하시오.','MEDIUM',NULL,128,10,1,'블랙잭','2025-11-24 05:26:39.059169','첫째 줄에 카드의 개수 N(3 ≤ N ≤ 100)과 M(10 ≤ M ≤ 300,000)이 주어진다. \n둘째 줄에는 카드에 쓰여 있는 수가 주어지며, 이 값은 100,000을 넘지 않는 양의 정수이다.\n\n합이 M을 넘지 않는 카드 3장을 찾을 수 있는 경우만 입력으로 주어진다.','첫째 줄에 M을 넘지 않으면서 M에 최대한 가까운 카드 3장의 합을 출력한다.',NULL),
(4,'2025-11-24 05:31:55.165855','님다 동아리 총무 윤호는 동아리 회식을 준비하기 위해 장부를 꼼꼼히 관리하고 있다.\n회식비 관리가 얼마나 중요한지 아는 윤호는 매번 정확히 기록하려고 애쓴다.\n\n그런데…\n윤호에게 인수인계를 받는 차기 총무 푸른이는 숫자를 불러줄 때마다 정확성보다 기세가 앞선다.\n가끔 멍해져서 이상한 숫자를 부르는 건 기본이고, 사고도 잦다.\n\n푸른이가 숫자를 잘못 불렀다는 걸 깨달으면 \n그때 0을 외치며 윤호에게 방금 적은 숫자를 지우라고 지시한다.\n\n윤호는 푸른이가 말한 모든 숫자를 순서대로 기록하며,\n0이 들리면 가장 최근에 적은 숫자를 삭제한다.\n\n이제 윤호는 최종적으로 장부에 남은 숫자들의 합을 알고 싶어 한다.\n\n윤호가 장부를 제대로 마무리할 수 있도록 도와주자!','MEDIUM',NULL,256,10,1,'장부 관리','2025-11-26 11:24:30.215204','첫 번째 줄에 정수 K가 주어진다. (1 ≤ K ≤ 100,000)\n\n이후 K개의 줄에 정수가 1개씩 주어진다. 정수는 0에서 1,000,000 사이의 값을 가지며, \n정수가 \"0\" 일 경우에는 가장 최근에 쓴 수를 지우고, 아닐 경우 해당 수를 쓴다.\n\n정수가 \"0\"일 경우에 지울 수 있는 수가 있음을 보장할 수 있다.','윤호가 최종적으로 적어 낸 수의 합을 출력한다. 최종적으로 적어낸 수의 합은 2^(31)-1보다 작거나 같은 정수이다.',NULL),
(5,'2025-11-24 05:43:01.296357','체인소 맨 레제편 영화를 감명깊게 본 명준이는 자기도 폭탄의 악마가 되어야겠다고 결심했다! \n\n그렇지만 실제로 폭탄을 터트리는 건 할 수 없으니… 자기가 폭탄의 악마로 등장하는 게임을 만들었다. \n\n폭탄의 악마인 명준이는 크기가 R×C인 직사각형 격자판 위에 서 있다. 격자의 각 칸은 비어있거나 폭탄이 들어있다.\n\n폭탄이 있는 칸은 3초가 지난 후에 폭발하고, 폭탄이 폭발한 이후에는 폭탄이 있던 칸이 파괴되어 빈 칸이 되며, 인접한 네 칸도 함께 파괴된다. 즉, 폭탄이 있던 칸이 (i, j)인 경우에 (i+1, j), (i-1, j), (i, j+1), (i, j-1)도 함께 파괴된다. \n만약, 폭탄이 폭발했을 때, 인접한 칸에 폭탄이 있는 경우에는 인접한 폭탄은 폭발 없이 파괴된다. \n따라서, 연쇄 반응은 없다.\n\n게임 속 명준이는 폭탄에 면역력을 가지고 있어서, 격자판의 모든 칸을 자유롭게 이동할 수 있다. 명준이는 다음과 같이 움직인다.\n\n- 가장 처음에 명준이는 일부 칸에 폭탄을 설치해 놓는다. 모든 폭탄이 설치된 시간은 같다.\n- 다음 1초 동안 명준이는 아무것도 하지 않는다.\n- 다음 1초 동안 폭탄이 설치되어 있지 않은 모든 칸에 폭탄을 설치한다. \n   즉, 모든 칸은 폭탄을 가지고 있게 된다. 폭탄은 모두 동시에 설치했다고 가정한다.\n- 1초가 지난 후에 3초 전에 설치된 폭탄이 모두 폭발한다.\n- 3과 4를 반복한다.\n\n폭탄을 설치해 놓은 초기 상태가 주어졌을 때, N초가 흐른 후의 격자판 상태를 구하려고 한다.\n\n예를 들어, 초기 상태가 아래와 같은 경우를 보자.\n\n...\n.O.\n...\n\n1초가 지난 후에는 아무 일도 벌어지지 않기 때문에, 위와 같다고 볼 수 있다. 1초가 더 흐른 후에 격자판의 상태는 아래와 같아진다.\n\nOOO\nOOO\nOOO\n\n1초가 지난 후엔 가운데에 있는 폭탄이 폭발해 가운데 칸과 인접한 네 칸이 빈 칸이 된다.\n\nO.O\n...\nO.O','MEDIUM',NULL,512,15,2,'BOOM!','2025-11-24 05:43:57.937260','첫째 줄에 R, C, N (1 ≤ R, C, N ≤ 200)이 주어진다.\n둘째 줄부터 R개의 줄에 격자판의 초기 상태가 주어진다. 빈 칸은 \'.\'로, 폭탄은 \'O\'로 주어진다.','총 R개의 줄에 N초가 지난 후의 격자판 상태를 출력한다.',NULL),
(6,'2025-11-24 05:52:58.235146','미술 시간, 건희와 현준이는 NxN 크기의 픽셀 아트를 감상하고 있다. \n이 그림은 각 칸이 R(빨강), G(초록), B(파랑) 중 하나로 칠해져 있다.\n\n평소 \"나는 세상의 모든 색을 구분하는 매의 눈을 가졌다\"라고 자부하는 건희는 빨강, 초록, 파랑을 완벽하게 구별하여 그림의 구역을 나눈다. \n같은 색상이 상하좌우로 인접해 있으면 하나의 구역으로 본다.\n\n반면, 자칭 \"색채의 마술사\"이자 타칭 \"적록색약\"인 현준이는 독특한 예술관을 가지고 있다. \n현준이는 \"빨간색이나 초록색이나 그게 그거 아니냐? 둘 다 따뜻한 느낌이니 같은 색이지!\"라고 우기며, \n빨강(R)과 초록(G)을 차이를 전혀 느끼지 못하고 같은 구역으로 묶어버린다. \n(물론 파랑(B)은 기가 막히게 구별한다.)\n\n예를 들어 그림이 다음과 같다고 치자.\nRRRBB\nGGBBB\nBBBRR\nBBRRR\nRRRRR\n\n- 매의 눈 건희: \"야, 딱 봐도 구역이 4개네!\" (빨강 뭉치 2개, 파랑 1개, 초록 1개)\n- 우기는 현준: \"무슨 소리야? 내 예술적인 눈으로 보면 딱 3개구만!\" (빨강-초록 뭉치 2개, 파랑 1개)\n\n이 두 사람이 이 그림을 봤을 때, 건희가 보는 구역의 개수와 현준이가 보는 구역의 개수를 구해서 논쟁을 종결시키는 프로그램을 작성하시오.','HARD',NULL,128,25,1,'환장의 미술 수업','2025-11-24 05:54:25.710073','첫째 줄에 N이 주어진다. (1 ≤ N ≤ 100) \n둘째 줄부터 N개 줄에는 그림이 주어진다.','적록색약이 아닌 사람이 봤을 때의 구역의 개수와 적록색약인 사람이 봤을 때의 구역의 수를 공백으로 구분해 출력한다.',NULL),
(7,'2025-11-24 05:56:01.271996','크기가 N×M인 지도가 존재한다. 지도의 오른쪽은 동쪽, 위쪽은 북쪽이다. 이 지도의 위에 주사위가 하나 놓여져 있으며, 주사위의 전개도는 아래와 같다. 지도의 좌표는 (r, c)로 나타내며, r는 북쪽으로부터 떨어진 칸의 개수, c는 서쪽으로부터 떨어진 칸의 개수이다. \n\n  2\n4 1 3\n  5\n  6\n\n주사위는 지도 위에 윗 면이 1이고, 동쪽을 바라보는 방향이 3인 상태로 놓여져 있으며, 놓여져 있는 곳의 좌표는 (x, y) 이다. 가장 처음에 주사위에는 모든 면에 0이 적혀져 있다.\n\n지도의 각 칸에는 정수가 하나씩 쓰여져 있다. 주사위를 굴렸을 때, 이동한 칸에 쓰여 있는 수가 0이면, 주사위의 바닥면에 쓰여 있는 수가 칸에 복사된다. 0이 아닌 경우에는 칸에 쓰여 있는 수가 주사위의 바닥면으로 복사되며, 칸에 쓰여 있는 수는 0이 된다.\n\n주사위를 놓은 곳의 좌표와 이동시키는 명령이 주어졌을 때, 주사위가 이동했을 때 마다 상단에 쓰여 있는 값을 구하는 프로그램을 작성하시오.\n\n주사위는 지도의 바깥으로 이동시킬 수 없다. 만약 바깥으로 이동시키려고 하는 경우에는 해당 명령을 무시해야 하며, 출력도 하면 안 된다.','HARD',NULL,512,30,2,'주사위 굴리기','2025-11-24 05:56:40.652470','첫째 줄에 지도의 세로 크기 N, 가로 크기 M (1 ≤ N, M ≤ 20), 주사위를 놓은 곳의 좌표 x, y(0 ≤ x ≤ N-1, 0 ≤ y ≤ M-1), 그리고 명령의 개수 K (1 ≤ K ≤ 1,000)가 주어진다.\n\n둘째 줄부터 N개의 줄에 지도에 쓰여 있는 수가 북쪽부터 남쪽으로, 각 줄은 서쪽부터 동쪽 순서대로 주어진다. 주사위를 놓은 칸에 쓰여 있는 수는 항상 0이다. 지도의 각 칸에 쓰여 있는 수는 10 미만의 자연수 또는 0이다.\n\n마지막 줄에는 이동하는 명령이 순서대로 주어진다. 동쪽은 1, 서쪽은 2, 북쪽은 3, 남쪽은 4로 주어진다.','이동할 때마다 주사위의 윗 면에 쓰여 있는 수를 출력한다. 만약 바깥으로 이동시키려고 하는 경우에는 해당 명령을 무시해야 하며, 출력도 하면 안 된다.',NULL);
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_groups`
--

DROP TABLE IF EXISTS `study_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_groups` (
  `group_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `group_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_public` bit(1) NOT NULL,
  `max_members` int NOT NULL,
  `participation_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` bigint NOT NULL,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `UK_ojv08tn8vg9sy9ho5st2b7cdv` (`participation_code`),
  KEY `FK5hmdtbkpguqov559w8qy94625` (`created_by`),
  CONSTRAINT `FK5hmdtbkpguqov559w8qy94625` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_groups`
--

LOCK TABLES `study_groups` WRITE;
/*!40000 ALTER TABLE `study_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `study_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` text NOT NULL,
  `language` enum('JAVA','CPP17','PYTHON','C99') NOT NULL,
  `status` enum('PENDING','JUDGING','ACCEPTED','WRONG_ANSWER','TIME_LIMIT_EXCEEDED','MEMORY_LIMIT_EXCEEDED','RUNTIME_ERROR','COMPILATION_ERROR','SYSTEM_ERROR') NOT NULL,
  `submitted_at` datetime(6) NOT NULL,
  `problem_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj5kbdqokftgx992cx24x3s583` (`problem_id`),
  KEY `FK760bgu69957phd7hax608jdms` (`user_id`),
  CONSTRAINT `FK760bgu69957phd7hax608jdms` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKj5kbdqokftgx992cx24x3s583` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=664 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES
(156,'#include <iostream>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    \n    return 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 09:17:03.360509',4,8),
(157,'#include <iostream>\n\nusing namespace std;\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n;\n	cin >> n;\n	for (int i = 0; i < n; i++) {\n		cout << \"Hello, NIMDA!\" << \'\\n\';\n	}\n\n	return 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 10:31:05.304084',1,1),
(158,'\n	#include <iostream>\n\n	using namespace std;\n\n	int main()\n	{\n		ios::sync_with_stdio(false);\n		cin.tie(0);\n	\n		int n;\n		cin >> n;\n		for (int i = 0; i < n; i++) {\n			cout << \"\\\"Hello, NIMDA!\\\"\" << \'\\n\';\n		}\n\n\n		return 0;\n	}\n','CPP17','ACCEPTED','2025-11-27 10:32:02.035709',1,1),
(159,'#include <iostream>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(0); cout.tie(0);\n\n    int n;\n    cin >> n;\n    for (int i = 0; i < n; i++) {\n        cout << \"\\\"Hello, NIMDA!\\\"\" << endl;\n    }\n}','CPP17','ACCEPTED','2025-11-27 10:34:03.082942',1,5),
(160,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n\n    cin >> n;\n    for (int i=0; i < n; i++) {\n        cout << \"\\\"Hello, NIMDA!\\\"\" << endl;\n    }\n    return 0;\n}','CPP17','ACCEPTED','2025-11-27 10:34:17.117408',1,6),
(161,'#include <iostream>\nusing namespace std;\nint main()\n{\n    int N;\n    cin >> N;\n\n    for (int i = 0; i < N; i++) {\n        cout << \"\\\"Hello, NIMDA\\\"\"<<\"\\n\";\n\n    }\n}\n','CPP17','WRONG_ANSWER','2025-11-27 10:34:20.574648',1,3),
(162,'#include <iostream>\nusing namespace std;\nint main()\n{\n    int N;\n    cin >> N;\n\n    for (int i = 0; i < N; i++) {\n        cout << \"\\\"Hello, NIMDA!\\\"\"<<\"\\n\";\n\n    }\n}\n','CPP17','ACCEPTED','2025-11-27 10:34:55.173708',1,3),
(163,'#include <stdio.h>\nint main() {\n	int N;\n	scanf_s(\"%d\", &N);\n	for (int i = 0; i < N; i++) {\n		printf(\"\\\"Hello, NIMDA!\\\"\\n\");\n	}\n	return 0;\n}','CPP17','COMPILATION_ERROR','2025-11-27 10:36:39.905148',1,2),
(164,'#include <stdio.h>\nint main() {\n	int N;\n	scanf_s(\"%d\", &N);\n	for (int i = 0; i < N; i++) {\n		printf(\"\\\"Hello, NIMDA!\\\"\\n\");\n	}\n	return 0;\n}','C99','COMPILATION_ERROR','2025-11-27 10:36:46.294310',1,2),
(165,'#include <stdio.h>\nint main() {\n	int N;\n	scanf(\"%d\", &N);\n	for (int i = 0; i < N; i++) {\n		printf(\"\\\"Hello, NIMDA!\\\"\\n\");\n	}\n	return 0;\n}','C99','ACCEPTED','2025-11-27 10:37:01.914523',1,2),
(166,'#include <iostream>\n\nusing namespace std;\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n	\n	int h, m;\n	cin >> h >> m;\n\n	int times = 60 * h + m;\n\n	times -= 45;\n	if (times < 0) {\n		times += 1440;\n	}\n\n	h = times / 60;\n	m = times % 60;\n\n	cout << h << \' \' << m;\n\n	return 0;\n}\n','CPP17','ACCEPTED','2025-11-27 10:39:09.086896',2,1),
(167,'#include<iostream>\nusing namespace std;\nint main(void){\nint N;\nint i = 0;\ncin >> N;\nfor (; i < N; i++) {\n	cout << \"\\\"Hello,Nimda!\\\"\" << endl;\n}\nreturn 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 10:42:23.525722',1,4),
(168,'#include<iostream>\nusing namespace std;\nint main(void){\nint N;\nint i = 0;\ncin >> N;\nfor (; i < N; i++) {\n	cout << \"\\\"Hello, Nimda!\\\"\" << endl;\n}\nreturn 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 10:43:01.414736',1,4),
(169,'#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n	int k;\n	vector <int> total;\n\n	int totals = 0;\n\n	cin >> k;\n\n	for (int i = 0; i < k; i++) {\n		int n;\n		cin >> n;\n		if (n == 0) {\n			total.pop_back();\n		}\n		else {\n			total.push_back(n);\n		}\n	}\n\n	for (int i = 0; i < total.size(); i++) {\n		totals += total[i];\n	}\n	\n	cout << totals;\n	\n}','CPP17','ACCEPTED','2025-11-27 10:43:23.730330',4,6),
(170,'#include<iostream>\nusing namespace std;\nint main(void){\nint N;\nint i = 0;\ncin >> N;\nfor (; i < N; i++) {\n	cout << \"\\\"Hello, NIMDA!\\\"\" << endl;\n}\nreturn 0;\n}','CPP17','ACCEPTED','2025-11-27 10:43:28.201759',1,4),
(171,'#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int k;\n	cin >> k;\n	vector<int> v;\n\n	for (int i = 0; i < k; i++) {\n		int num;\n		cin >> num;\n		\n		if (num == 0) {\n			v.pop_back();\n		}\n		else {\n			v.push_back(num);\n		}\n	}\n\n	long sum = 0;\n	for (int i = 0; i < v.size(); i++) {\n		sum += v[i];\n	}\n	cout << sum;\n\n	return 0;\n}\n','CPP17','ACCEPTED','2025-11-27 10:43:58.172141',4,1),
(172,'\n#include <iostream>\nusing namespace std;\nint main() {\n\n	int hour;\n	int min;\n	cin >> hour >> min;\n	//scanf_s(\"1%d %d\", &hour, &min);\n	if (min >= 45 && hour != 0) {\n		printf(\"%d %d\", hour, min-45);\n	}\n	else if (min < 45 && hour != 0) {\n		printf(\"%d %d\", hour - 1, min + 60 - 45);\n	}\n\n	else if (min < 45 && hour == 0) {\n		printf(\"%d %d\", 23, min + 60 - 45);\n	}\n}','CPP17','WRONG_ANSWER','2025-11-27 10:49:45.531157',2,5),
(173,'import java.io.*;\nimport java.util.StringTokenizer;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int H = Integer.parseInt(st.nextToken());\n        int M = Integer.parseInt(st.nextToken());\n\n        if(M > 45){\n\n            M = M- 45;\n\n        }else{\n\n            if(H == 0){\n                H = 24;\n            }\n\n            H = H - 1;\n            M = 60 - (45 - M);\n        }\n\n\n        System.out.print(H +\" \"+ M);\n\n    }\n\n}\n\n','JAVA','WRONG_ANSWER','2025-11-27 10:51:30.949590',2,3),
(174,'#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n	int h, m;\n\n	cin >> h >> m;\n\n	if (h == 0) {\n		h = 24;\n	}\n\n	if (m >= 45) {\n		m -= 45;\n	}\n	else {\n		h--;\n		m += 60;\n		m -= 45;\n	}\n	\n	\n\n	cout << h <<\" \" << m;\n	\n}','CPP17','WRONG_ANSWER','2025-11-27 10:51:35.468007',2,6),
(175,'\n#include <iostream>\nusing namespace std;\nint main() {\n\n	int hour;\n	int min;\n	cin >> hour >> min;\n	//scanf_s(\"1%d %d\", &hour, &min);\n	if (min >= 45 && hour != 0) {\n		printf(\"%d %d\", hour, min-45);\n	}\n	else if (min < 45 && hour != 0) {\n		printf(\"%d %d\", hour - 1, min + 60 - 45);\n	}\n\n	else if (min < 45 && hour == 0) {\n		printf(\"%d %d\", 23, min + 60 - 45);\n	}\n	else if (min == 45 && hour == 0) {\n		printf(\"%d %d\",0,0);\n	}\n}','CPP17','WRONG_ANSWER','2025-11-27 10:51:46.823429',2,5),
(176,'import java.io.*;\nimport java.util.StringTokenizer;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int H = Integer.parseInt(st.nextToken());\n        int M = Integer.parseInt(st.nextToken());\n\n        if(M >= 45){\n\n            M = M- 45;\n\n        }else{\n\n            if(H == 0){\n                H = 24;\n            }\n\n            H = H - 1;\n            M = 60 - (45 - M);\n        }\n\n\n        System.out.print(H +\" \"+ M);\n\n    }\n\n}\n\n','JAVA','ACCEPTED','2025-11-27 10:52:44.179217',2,3),
(177,'#include <iostream>\nusing namespace std;\n\nint main() {\n	int h, m;\n\n	cin >> h >> m;\n\n	if (h == 0) {\n		h = 24;\n	}\n\n	if (m >= 45) {\n		m -= 45;\n	}\n	else {\n		h--;\n		m += 15;\n	}\n	\n\n	cout << h <<\" \"<< m;\n	\n}','CPP17','WRONG_ANSWER','2025-11-27 10:53:38.362329',2,6),
(178,'#include<iostream>\nusing namespace std;\nint main(void) {\n	int H;\n	int M;\n\n	cin >> H;\n	cin >> M;\n	if (H == 0)\n		H = 24;\n	int totalmin = H * 60 + M;\n\n	\n\n	totalmin -= 45;\n\n	int alarm_H = totalmin / 60;\n	int alarm_M = totalmin % 60;\n\n	if (alarm_H == 12)\n		alarm_H = 0;\n\n	cout << alarm_H << \" \" << alarm_M;\n\n	return 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 10:54:23.521260',2,4),
(179,'#include<iostream>\nusing namespace std;\nint main(void) {\n	int H;\n	int M;\n\n	cin >> H;\n	cin >> M;\n	if (H == 0)\n		H = 24;\n	int totalmin = H * 60 + M;\n\n	\n\n	totalmin -= 45;\n\n	int alarm_H = totalmin / 60;\n	int alarm_M = totalmin % 60;\n\n	if (alarm_H == 24)\n		alarm_H = 0;\n\n	cout << alarm_H << \" \" << alarm_M;\n\n	return 0;\n}','CPP17','ACCEPTED','2025-11-27 10:55:03.481488',2,4),
(180,'#include <iostream>\nusing namespace std;\n\nint main() {\n	int h, m;\n\n	cin >> h >> m;\n\n	if (h == 0) {\n		h = 24;\n	}\n\n	if (m >= 45) {\n		m -= 45;\n	}\n	else {\n		h--;\n		m += 15;\n	}\n\n	if (h == 0 && m == 0) {\n		h = 24;\n	}\n	\n\n	cout << h <<\" \"<< m;\n	\n}','CPP17','WRONG_ANSWER','2025-11-27 10:55:13.241196',2,6),
(181,'#include <iostream>\nusing namespace std;\nint main() {\n\n	int hour;\n	int min;\n	cin >> hour >> min;\n	//scanf_s(\"1%d %d\", &hour, &min);\n	if (min >= 45 && hour != 0) {\n		printf(\"%d %d\", hour, min-45);\n	}\n	else if (min < 45 && hour != 0) {\n		printf(\"%d %d\", hour - 1, min + 60 - 45);\n	}\n\n	else if (min < 45 && hour == 0) {\n		printf(\"%d %d\", 23, min + 60 - 45);\n	}\n	else if (min>=45 && hour == 0) {\n		printf(\"%d %d\", hour, min - 45);\n	}\n}','CPP17','ACCEPTED','2025-11-27 10:56:07.502228',2,5),
(182,'#include <iostream>\nusing namespace std;\n\nint main() {\n	int h, m;\n\n	cin >> h >> m;\n\n	if (h == 0) {\n		h = 24;\n	}\n\n	if (m >= 45) {\n		m -= 45;\n	}\n	else {\n		h--;\n		m += 15;\n	}\n\n	if (h == 24 && m == 0) {\n		h = 0;\n	}\n	\n\n	cout << h <<\" \"<< m;\n	\n}','CPP17','WRONG_ANSWER','2025-11-27 10:56:31.493220',2,6),
(183,'#include <iostream>\nusing namespace std;\n\nint main() {\n	int h, m;\n\n	cin >> h >> m;\n\n	if (h == 0&& m <45) {\n		h = 24;\n	}\n\n	if (m >= 45) {\n		m -= 45;\n	}\n	else {\n		h--;\n		m += 15;\n	}\n\n	\n	\n\n	cout << h <<\" \"<< m;\n	\n}','CPP17','ACCEPTED','2025-11-27 10:58:40.880526',2,6),
(184,'#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n, m;\n	cin >> n >> m;\n\n	vector<int> vec(n);\n	for (int i = 0; i < n; i++) {\n		cin >> vec[i];\n	}\n\n	vector<int> result;\n	for (int i = 0; i < n-2; i++) {\n		for (int j = i+1; j < n - 1; j++) {\n			for (int k = j+1; k < n; k++) {\n				long sum = vec[i] + vec[j] + vec[k];\n				if (sum <= m) {\n					result.push_back(sum);\n				}\n			}\n		}\n	}\n	sort(result.begin(), result.end());\n	cout << result.back();\n	return 0;\n}\n','CPP17','ACCEPTED','2025-11-27 11:01:08.536887',3,1),
(185,'\n#include <iostream>\n#include <stack>\nusing namespace std;\nint main() {\n	ios::sync_with_stdio(false);\n	cin.tie(0); cout.tie(0);\n\n	stack<int> q;\n	int k;\n	cin >> k;\n	\n	int n;\n\n	for (int i = 0; i < k; i++) {\n		cin >> n;\n		if (n == 0) q.pop();\n		else q.push(n);\n	}\n	int num = q.size();\n	long res = 0;\n	for (int i = 0; i < num; i++) {\n		res+= q.top();\n		q.pop();\n	}\n	cout << res << endl;\n}','CPP17','ACCEPTED','2025-11-27 11:08:36.118945',4,5),
(186,'#include <iostream>\n#include <memory>\n#include <string>\n\nint main() {\n	\n	//횟수 입력\n\n	int K;\n	std::cin >> K;\n\n	int* nums = (int*)malloc(sizeof(int) * K);\n\n	int current_count = 0;\n	\n	for (int i = 0; i < K; i++) {\n		int input;\n		std::cin >> input;\n		nums[current_count] = input;\n		\n		if(input != 0) {\n			current_count++;\n		}\n		else {\n			current_count--;\n		}\n	}\n\n	int result = 0;\n\n	for (int i = 0; i < current_count; i++) {\n		result += nums[i];\n	}\n\n	std::cout << result;\n\n	return 0;\n}','CPP17','ACCEPTED','2025-11-27 11:14:37.459421',4,4),
(187,'#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main()\n{\n\n    int K;\n    cin >> K;\n\n    queue<int> q;\n\n    for (int i = 0; i < K; i++) {\n        int n;\n        cin >> n;\n        if (n != 0) {\n            q.push(n);\n        }\n        else {\n            q.pop();\n        }\n    }\n\n    int hap = 0;\n    for (int i = 0; i < q.size(); i++) {\n        hap = q.front() + hap;\n        q.pop();\n    }\n    cout << hap;\n}','CPP17','WRONG_ANSWER','2025-11-27 11:19:16.889065',4,3),
(188,'#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main()\n{\n\n    int K;\n    cin >> K;\n\n    queue<int> q;\n\n    for (int i = 0; i < K; i++) {\n        int n;\n        cin >> n;\n        if (n != 0) {\n            q.push(n);\n        }\n        else {\n            q.pop();\n        }\n    }\n\n    int hap = 0;\n    int cnt = q.size();\n    for (int i = 0; i < cnt; i++) {\n        hap = q.front() + hap;\n        q.pop();\n    }\n    cout << hap;\n}','CPP17','WRONG_ANSWER','2025-11-27 11:22:48.326699',4,3),
(189,'#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main()\n{\n\n    int K;\n    cin >> K;\n\n    queue<int> q;\n\n    for (int i = 0; i < K; i++) {\n        int n;\n        cin >> n;\n        if (n != 0) {\n            q.push(n);\n        }\n        else {\n            q.pop();\n        }\n    }\n\n    int hap = 0;\n    int cnt = q.size();\n    for (int i = 0; i < cnt; i++) {\n        hap = q.back() + hap;\n        q.pop();\n    }\n    cout << hap;\n}','CPP17','WRONG_ANSWER','2025-11-27 11:31:09.340506',4,3),
(190,'#include <stdio.h>\n\nint main() {\n	int H, M;\n	scanf(\"%d %d\", &H, &M);\n\n	if (M - 45 > 0) {\n		if (H == 0) {\n			H = 23;\n		}\n		M = M - 45;\n	}\n	else if (M - 45 == 0) {\n		if (H == 0) {\n			H = 23;\n		}\n		H = H - 1;\n		M = M - 45;\n	}\n	else if(M - 45 < 0 && H != 0){\n		H = H - 1;\n		M = (M + 60) - 45;\n	}\n	else {\n		M = (M + 60) - 45;\n		H = 23;\n	}\n	printf(\"%d %d\", H, M);\n	return 0;\n}','C99','WRONG_ANSWER','2025-11-27 11:37:17.203927',2,2),
(191,'// 1127.cpp : 이 파일에는 \'main\' 함수가 포함됩니다. 거기서 프로그램 실행이 시작되고 종료됩니다.\n//\n\n#include <iostream>\n#include <stack>\nusing namespace std;\n\nint main()\n{\n\n    int K;\n    cin >> K;\n\n    stack<int> s;\n\n    for (int i = 0; i < K; i++) {\n        int n;\n        cin >> n;\n        if (n != 0) {\n            s.push(n);\n        }\n        else {\n            s.pop();\n        }\n    }\n\n    int hap = 0;\n    int cnt = s.size();\n    for (int i = 0; i < cnt; i++) {\n        \n        hap = s.top() + hap;\n        \n        s.pop();\n    }\n    cout << hap;\n}\n\n// 프로그램 실행: <Ctrl+F5> 또는 [디버그] > [디버깅하지 않고 시작] 메뉴\n// 프로그램 디버그: <F5> 키 또는 [디버그] > [디버깅 시작] 메뉴\n\n// 시작을 위한 팁: \n//   1. [솔루션 탐색기] 창을 사용하여 파일을 추가/관리합니다.\n//   2. [팀 탐색기] 창을 사용하여 소스 제어에 연결합니다.\n//   3. [출력] 창을 사용하여 빌드 출력 및 기타 메시지를 확인합니다.\n//   4. [오류 목록] 창을 사용하여 오류를 봅니다.\n//   5. [프로젝트] > [새 항목 추가]로 이동하여 새 코드 파일을 만들거나, [프로젝트] > [기존 항목 추가]로 이동하여 기존 코드 파일을 프로젝트에 추가합니다.\n//   6. 나중에 이 프로젝트를 다시 열려면 [파일] > [열기] > [프로젝트]로 이동하고 .sln 파일을 선택합니다.\n','CPP17','ACCEPTED','2025-11-27 11:41:49.825871',4,3),
(192,'#include <stdio.h>\n\nint main() {\n	int H, M;\n	scanf(\"%d %d\", &H, &M);\n\n	if (M - 45 > 0) {\n		if (H == 0) {\n			H = 23;\n		}\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H == 0) {\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H != 0) {\n		H = H - 1;\n		M = M - 45;\n	}\n	else if(M - 45 < 0 && H != 0){\n		H = H - 1;\n		M = (M + 60) - 45;\n	}\n	else {\n		M = (M + 60) - 45;\n		H = 23;\n	}\n	printf(\"%d %d\", H, M);\n	return 0;\n}','C99','WRONG_ANSWER','2025-11-27 11:41:52.218034',2,2),
(193,'#include <stdio.h>\n\nint main() {\n	int H, M;\n	scanf(\"%d %d\", &H, &M);\n\n	if (M - 45 > 0) {\n		if (H == 0) {\n			H = 23;\n		}\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H == 0) {\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H != 0) {\n		M = M - 45;\n	}\n	else if(M - 45 < 0 && H != 0){\n		H = H - 1;\n		M = (M + 60) - 45;\n	}\n	else {\n		M = (M + 60) - 45;\n		H = 23;\n	}\n	printf(\"%d %d\", H, M);\n	return 0;\n}','C99','WRONG_ANSWER','2025-11-27 11:43:09.992552',2,2),
(194,'\n#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n	ios::sync_with_stdio(false);\n	cin.tie(0); cout.tie(0);\n\n	int n, m;\n	vector<int> v;\n	int res = 0;\n	cin >> n >> m;\n\n	int number;\n\n	for (int i = 0; i < n; i++) {\n		cin >> number;\n		v.push_back(number);\n	}\n\n	for (int i = 0; i < n-2; i++) {\n		for (int j = i+1; j < n-1; j++) {\n			for (int k = j + 1; k < n; k++) {\n				int sum = v[i] + v[j] + v[k];\n				if (sum <= m && res < sum) res = sum;\n			}\n\n		}\n	}\n	cout << res<<endl;\n\n}\n','CPP17','ACCEPTED','2025-11-27 11:49:41.784255',3,5),
(195,'#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint r, c;\n\nvoid install(vector<vector<int>>& vec, int time) {\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n			}\n		}\n	}\n\n}\n\nvoid boom(vector<vector<int>> &vec, int time) {\n	int dx[] = {0, 1, 0, -1};\n	int dy[] = {1, 0, -1, 0};\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n				for (int k = 0; k < 4; k++) {\n					int nx = j + dx[k];\n					int ny = i + dy[k];\n\n					if (nx < 0 || ny < 0 || nx >= c || ny >= r) continue;\n					if (vec[ny][nx] == time - 2) continue;\n					vec[ny][nx] = time;\n				}\n			}\n		}\n	}\n}\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n;\n	cin >> r >> c >> n;\n	n -= 1;\n\n	vector<vector<int>> vec(r, vector<int>(c));\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			char in;\n			cin >> in;\n\n			if (in == \'.\') {\n				vec[i][j] = -1;\n			}\n			else {\n				vec[i][j] = 0;\n			}\n		}\n	}\n\n	for (int i = 1; i <= n; i++) {\n		if (i % 2 == 1) { // 설치\n			install(vec, i);\n		} else { // boom!\n			boom(vec, i);\n		}\n	}\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (n % 2 == 1) {\n				if (vec[i][j] == n || vec[i][j] == n - 1)\n					cout << \'O\';\n				else \n					cout << \'.\';\n			}\n			else { // 짝수\n				if (vec[i][j] % 2 == 1)\n					cout << \'O\';\n				else\n					cout << \'.\';\n			}\n		}\n		cout << \'\\n\';\n	}\n	return 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 11:52:25.461816',5,1),
(196,'#include <stdio.h>\n\nint main() {\n	int H, M;\n	scanf(\"%d %d\", &H, &M);\n\n	if (M - 45 > 0) {\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H == 0) {\n		M = M - 45;\n	}\n	else if (M - 45 == 0 && H != 0) {\n		M = M - 45;\n	}\n	else if(M - 45 < 0 && H != 0){\n		M = (M + 60) - 45;\n		H = H - 1;\n	}\n	else {\n		M = (M + 60) - 45;\n		H = 23;\n	}\n	printf(\"%d %d\", H, M);\n	return 0;\n}','C99','ACCEPTED','2025-11-27 11:52:26.591099',2,2),
(197,'#include <iostream>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    \n    return 0;\n}','CPP17','WRONG_ANSWER','2025-11-27 11:57:57.909853',1,1),
(198,'\n#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint r, c;\n\nvoid install(vector<vector<int>>& vec, int time) {\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n			}\n		}\n	}\n\n}\n\nvoid boom(vector<vector<int>> &vec, int time) {\n	int dx[] = {0, 1, 0, -1};\n	int dy[] = {1, 0, -1, 0};\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n				for (int k = 0; k < 4; k++) {\n					int nx = j + dx[k];\n					int ny = i + dy[k];\n\n					if (nx < 0 || ny < 0 || nx >= c || ny >= r) continue;\n					if (vec[ny][nx] == time - 2) continue;\n					vec[ny][nx] = time;\n				}\n			}\n		}\n	}\n}\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n;\n	cin >> r >> c >> n;\n	n--;\n\n	vector<vector<int>> vec(r, vector<int>(c));\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			char in;\n			cin >> in;\n\n			if (in == \'.\') {\n				vec[i][j] = -1;\n			}\n			else {\n				vec[i][j] = 0;\n			}\n		}\n	}\n\n	if (n == 0) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				if (vec[i][j] == -1) {\n					cout << \'.\';\n				}\n				else {\n					cout << \'O\';\n				}\n			}\n			cout << \'\\n\';\n		}\n		return 0;\n	}\n\n\n	for (int i = 1; i <= n; i++) {\n		if (i % 2 == 1) { // 설치\n			install(vec, i);\n		} else { // boom!\n			boom(vec, i);\n		}\n	}\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (n % 2 == 1) {\n				if (vec[i][j] == n || vec[i][j] == n - 1)\n					cout << \'O\';\n				else \n					cout << \'.\';\n			}\n			else { // 짝수\n				if (vec[i][j] % 2 == 1)\n					cout << \'O\';\n				else\n					cout << \'.\';\n			}\n		}\n		cout << \'\\n\';\n	}\n	return 0;\n}\n','CPP17','WRONG_ANSWER','2025-11-27 11:58:23.546947',5,1),
(199,'#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n#include<array>\n\nint main() {\n\n	int r, c, n;\n	cin >> r >> c >> n;\n\n	char array[201][201] = {0};\n\n	vector <int> a;\n	vector <int> b;\n\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			char input;\n			cin >> input;\n			array[i][j] = input;\n			if (array[i][j] == \'O\') {\n				a.push_back(i);\n				b.push_back(j);\n			}\n		}\n	}\n\n\n	//짝수일때\n	if (n % 2 == 0) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				array[i][j] = \'O\';\n			}\n		}\n	}\n	//폭탄 터짐\n	else if (n % 4 == 3) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				array[i][j] = \'O\';\n			}\n		}\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				for (int k = 0; k < a.size(); k++) {\n					if (a[k] == i && b[k] == j) {\n						array[i][j] = \'.\';\n						array[i][j+1] = \'.\';\n						array[i][j-1] = \'.\';\n						array[i+1][j] = \'.\';\n						array[i-1][j] = \'.\';\n\n					}\n				}\n			}\n		}\n	}\n	\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			cout << array[i][j];\n		}\n		cout<< endl;\n	}\n\n	\n\n}','CPP17','WRONG_ANSWER','2025-11-27 12:01:47.083388',5,6),
(200,'\n#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint r, c;\n\nvoid install(vector<vector<int>>& vec, int time) {\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n			}\n		}\n	}\n\n}\n\nvoid boom(vector<vector<int>> &vec, int time) {\n	int dx[] = {0, 1, 0, -1};\n	int dy[] = {1, 0, -1, 0};\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == time - 2) {\n				vec[i][j] = time;\n				for (int k = 0; k < 4; k++) {\n					int nx = j + dx[k];\n					int ny = i + dy[k];\n\n					if (nx < 0 || ny < 0 || nx >= c || ny >= r) continue;\n					if (vec[ny][nx] == time - 2) continue;\n					vec[ny][nx] = time;\n				}\n			}\n		}\n	}\n}\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n;\n	cin >> r >> c >> n;\n	n--;\n\n	vector<vector<int>> vec(r, vector<int>(c));\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			char in;\n			cin >> in;\n\n			if (in == \'.\') {\n				vec[i][j] = -1;\n			}\n			else {\n				vec[i][j] = 0;\n			}\n		}\n	}\n\n	if (n == 0) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				if (vec[i][j] == -1) {\n					cout << \'.\';\n				}\n				else {\n					cout << \'O\';\n				}\n			}\n			cout << \'\\n\';\n		}\n		return 0;\n	}\n\n\n	for (int i = 1; i <= n; i++) {\n		if (i % 2 == 1) { // 설치\n			install(vec, i);\n		} else { // boom!\n			boom(vec, i);\n		}\n	}\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (n % 2 == 1) {\n				if (vec[i][j] == n || vec[i][j] == n - 1)\n					cout << \'O\';\n				else \n					cout << \'.\';\n			}\n			else { // 짝수\n				if (vec[i][j] % 2 == 1)\n					cout << \'O\';\n				else\n					cout << \'.\';\n			}\n		}\n		cout << \'\\n\';\n	}\n	return 0;\n}\n','CPP17','WRONG_ANSWER','2025-11-27 12:28:50.449768',5,1),
(201,'// /*\n\n#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint r, c;\n\nvoid install(vector<vector<int>>& vec) {\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			if (vec[i][j] == 1) {\n				vec[i][j] = 2;\n			} else if (vec[i][j] == 0) {\n				vec[i][j] = 1;\n			}\n		}\n	}\n\n}\n\nvoid boom(vector<vector<int>> &vec) {\n	int dx[] = {0, 1, 0, -1};\n	int dy[] = {1, 0, -1, 0};\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n\n			if (vec[i][j] == 2) {\n				vec[i][j] = 0;\n\n				for (int k = 0; k < 4; k++) {\n					int nx = j + dx[k];\n					int ny = i + dy[k];\n\n					if (nx < 0 || ny < 0 || nx >= c || ny >= r) continue;\n					if (vec[ny][nx] == 2) continue;\n					vec[ny][nx] = 0;\n				}\n			}\n		}\n	}\n}\n\nint main()\n{\n	ios::sync_with_stdio(false);\n	cin.tie(0);\n\n	int n;\n	cin >> r >> c >> n;\n	n--;\n\n	vector<vector<int>> vec(r, vector<int>(c));\n\n	for (int i = 0; i < r; i++) {\n		for (int j = 0; j < c; j++) {\n			char in;\n			cin >> in;\n\n			if (in == \'.\') {\n				vec[i][j] = 0;\n			}\n			else {\n				vec[i][j] = 1;\n			}\n		}\n	}\n\n	if (n == 0) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				if (vec[i][j] == 0) {\n					cout << \'.\';\n				} else {\n					cout << \'O\';\n				}\n			}\n			cout << \'\\n\';\n		}\n		return 0;\n	}\n\n	for (int i = 1; i <= n; i++) {\n		if (i % 2 == 1) { // 설치\n			install(vec);\n		}\n		else { // boom!\n			boom(vec);\n		}\n	}\n\n	if (n % 2 == 0) {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				if (vec[i][j] == 0) {\n					cout << \'.\';\n				}\n				else {\n					cout << \'O\';\n				}\n			}\n			cout << \'\\n\';\n		}\n	}\n	else {\n		for (int i = 0; i < r; i++) {\n			for (int j = 0; j < c; j++) {\n				cout << \'O\';\n			}\n			cout << \'\\n\';\n		}\n	}\n\n	return 0;\n}\n\n// */','CPP17','ACCEPTED','2025-11-27 12:28:55.026059',5,1),
(202,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:46:52.156340',1,1),
(203,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:48:29.164546',2,1),
(204,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:48:48.835905',1,1),
(205,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:49:09.190362',1,1),
(206,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:49:29.182785',1,1),
(207,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:49:39.586395',1,1),
(208,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:49:50.097950',2,1),
(209,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:00.516744',2,1),
(210,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:10.901850',2,1),
(211,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:22.460076',1,1),
(212,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:50:32.792590',1,1),
(213,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:37.258206',1,1),
(214,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:41.624903',2,1),
(215,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:45.860667',1,1),
(216,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:50:50.018694',1,1),
(217,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:50:54.260477',1,1),
(218,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:50:58.807506',1,1),
(219,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:02.850015',1,1),
(220,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:06.814868',1,1),
(221,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:11.394412',1,1),
(222,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:51:15.679583',1,1),
(223,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:19.731421',1,1),
(224,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:24.263394',1,1),
(225,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:28.515521',2,1),
(226,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:51:32.447726',1,1),
(227,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:34.893230',2,1),
(228,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:37.617134',2,1),
(229,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:40.158751',1,1),
(230,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:42.655306',1,1),
(231,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:45.415773',2,1),
(232,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:47.993805',1,1),
(233,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:51:50.546218',1,1),
(234,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:53.020018',2,1),
(235,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:51:55.560891',1,1),
(236,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:51:58.118194',2,1),
(237,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:00.716229',1,1),
(238,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:03.405664',1,1),
(239,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:06.213577',1,1),
(240,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:52:08.745563',1,1),
(241,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:11.306188',1,1),
(242,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:13.990371',1,1),
(243,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:16.705897',1,1),
(244,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:19.312020',1,1),
(245,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:52:21.912401',1,1),
(246,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:52:24.588561',1,1),
(247,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:27.004860',2,1),
(248,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:29.697160',1,1),
(249,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:31.778208',1,1),
(250,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:34.103031',2,1),
(251,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:36.179652',1,1),
(252,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:38.348265',1,1),
(253,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:40.497609',1,1),
(254,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:42.616903',2,1),
(255,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:44.996478',2,1),
(256,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:47.046241',1,1),
(257,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:52:49.247302',1,1),
(258,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:51.507179',1,1),
(259,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:52:54.581774',1,1),
(260,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:57.660778',1,1),
(261,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:52:59.895714',2,1),
(262,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:02.398240',2,1),
(263,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:04.786619',1,1),
(264,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:07.265175',2,1),
(265,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:09.793696',2,1),
(266,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:12.594038',2,1),
(267,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:15.347717',1,1),
(268,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:17.999481',2,1),
(269,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:53:20.458007',1,1),
(270,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:23.011599',2,1),
(271,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:25.446660',2,1),
(272,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:27.514156',1,1),
(273,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:29.670160',1,1),
(274,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:31.850948',2,1),
(275,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:33.987317',1,1),
(276,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:53:36.205944',1,1),
(277,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:53:38.205207',1,1),
(278,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:40.364089',2,1),
(279,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:42.535048',1,1),
(280,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:44.560244',2,1),
(281,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:46.803147',1,1),
(282,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:49.235131',1,1),
(283,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:51.552872',1,1),
(284,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:53.700619',1,1),
(285,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:55.928159',2,1),
(286,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:53:58.173579',1,1),
(287,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:00.530513',2,1),
(288,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:02.732596',1,1),
(289,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:54:04.839714',1,1),
(290,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:06.979186',1,1),
(291,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:09.267906',2,1),
(292,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:11.565252',1,1),
(293,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:13.678443',1,1),
(294,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:15.849467',1,1),
(295,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:18.036076',1,1),
(296,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:20.065051',1,1),
(297,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:22.368841',2,1),
(298,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:54:24.564557',1,1),
(299,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:26.675842',1,1),
(300,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:28.836901',2,1),
(301,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:31.024004',1,1),
(302,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:33.273820',1,1),
(303,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:54:35.336435',1,1),
(304,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:54:37.426611',1,1),
(305,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:39.648905',1,1),
(306,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:54:41.793480',1,1),
(307,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:43.845286',1,1),
(308,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:46.061712',1,1),
(309,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:48.237424',1,1),
(310,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:50.312164',1,1),
(311,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:52.346910',1,1),
(312,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:54.493199',1,1),
(313,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:56.536167',2,1),
(314,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:54:58.717549',1,1),
(315,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:00.812666',1,1),
(316,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:03.140892',2,1),
(317,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:05.291999',1,1),
(318,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:07.577156',1,1),
(319,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:10.524838',1,1),
(320,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:55:13.408563',1,1),
(321,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:15.399517',1,1),
(322,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:17.453675',2,1),
(323,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:19.502717',1,1),
(324,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:21.703240',1,1),
(325,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:55:23.819994',1,1),
(326,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:25.930259',2,1),
(327,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:28.123365',1,1),
(328,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:30.229031',2,1),
(329,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:32.168384',1,1),
(330,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:33.956973',1,1),
(331,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:35.920170',2,1),
(332,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:37.895931',1,1),
(333,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:39.774371',1,1),
(334,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:41.691194',1,1),
(335,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:43.538181',1,1),
(336,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:45.393030',1,1),
(337,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:47.201896',2,1),
(338,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:55:50.414983',1,1),
(339,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:53.277298',2,1),
(340,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:55.674587',2,1),
(341,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:55:57.909992',2,1),
(342,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:01.229408',2,1),
(343,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:03.721495',1,1),
(344,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:06.405052',1,1),
(345,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:08.690189',1,1),
(346,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:11.303810',1,1),
(347,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:13.677606',1,1),
(348,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:16.078149',2,1),
(349,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:18.183041',1,1),
(350,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:20.594276',1,1),
(351,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:22.612758',2,1),
(352,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:24.572605',1,1),
(353,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:26.524208',1,1),
(354,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:28.605818',1,1),
(355,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:30.587983',2,1),
(356,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:32.556708',1,1),
(357,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:34.392694',1,1),
(358,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:36.330977',2,1),
(359,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:38.371125',1,1),
(360,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:40.245058',2,1),
(361,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:42.355173',1,1),
(362,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:44.375737',1,1),
(363,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:46.264984',2,1),
(364,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:48.681208',1,1),
(365,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:50.533326',1,1),
(366,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:52.377552',1,1),
(367,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:54.524262',1,1),
(368,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b\n    cin >> a >> b;  // 세미콜론 누락\n    cout << a + b << endl;\n    return 0;\n}','CPP17','COMPILATION_ERROR','2025-12-06 15:56:56.680775',1,1),
(369,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a * b << endl;  // 곱셈으로 잘못 계산\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 15:56:58.575106',1,1),
(370,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:25.603075',2,1),
(371,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:28.208479',2,1),
(372,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:30.813716',1,1),
(373,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:33.346895',2,1),
(374,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:35.861509',1,1),
(375,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:38.362708',1,1),
(376,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:40.951131',1,1),
(377,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:43.688712',1,1),
(378,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:46.344062',1,1),
(379,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:49.096615',1,1),
(380,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:51.669894',2,1),
(381,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:54.160139',1,1),
(382,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:56.631445',2,1),
(383,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:19:59.266438',1,1),
(384,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:02.751152',1,1),
(385,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:05.455861',2,1),
(386,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:08.096309',1,1),
(387,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:10.682978',2,1),
(388,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:13.341892',2,1),
(389,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:16.236609',2,1),
(390,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:18.895411',1,1),
(391,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:21.615905',1,1),
(392,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:24.346072',1,1),
(393,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:26.997372',1,1),
(394,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:29.277664',2,1),
(395,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:31.560040',1,1),
(396,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:33.907845',2,1),
(397,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:36.191270',1,1),
(398,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:38.593726',1,1),
(399,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:40.858061',1,1),
(400,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:43.199808',1,1),
(401,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:45.640331',1,1),
(402,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:48.041238',1,1),
(403,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:50.277895',2,1),
(404,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:52.458493',1,1),
(405,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:54.814014',2,1),
(406,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:57.158140',1,1),
(407,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:20:59.375374',1,1),
(408,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:02.352890',2,1),
(409,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:04.623223',2,1),
(410,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:06.939691',2,1),
(411,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:09.199188',2,1),
(412,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:11.558104',1,1),
(413,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:14.003336',1,1),
(414,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:16.259084',2,1),
(415,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:18.602085',2,1),
(416,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:21.003744',2,1),
(417,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:23.260076',1,1),
(418,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:25.522719',1,1),
(419,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:27.840224',2,1),
(420,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:30.239437',1,1),
(421,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:32.439240',2,1),
(422,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:34.830499',1,1),
(423,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:37.240250',2,1),
(424,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:39.597530',2,1),
(425,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:41.791526',1,1),
(426,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:44.080162',1,1),
(427,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:46.531841',1,1),
(428,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:48.944606',1,1),
(429,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:51.138913',2,1),
(430,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:53.360948',1,1),
(431,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:55.559022',2,1),
(432,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:21:57.936297',2,1),
(433,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:00.415591',1,1),
(434,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:02.733977',2,1),
(435,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:05.157753',2,1),
(436,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:07.509522',2,1),
(437,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:09.836759',1,1),
(438,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:12.261534',2,1),
(439,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:14.501328',2,1),
(440,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:16.779493',1,1),
(441,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:19.139765',2,1),
(442,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:21.554779',1,1),
(443,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:23.997571',2,1),
(444,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:26.324078',1,1),
(445,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:28.748709',1,1),
(446,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:31.142038',2,1),
(447,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:33.567985',2,1),
(448,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:35.961369',2,1),
(449,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:38.213805',1,1),
(450,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:40.518587',1,1),
(451,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:42.960705',2,1),
(452,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:45.300850',2,1),
(453,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:47.788604',1,1),
(454,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:50.168472',1,1),
(455,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:52.508930',2,1),
(456,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:54.837090',2,1),
(457,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:57.092482',2,1),
(458,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:22:59.455098',2,1),
(459,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:02.361449',1,1),
(460,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:04.652483',2,1),
(461,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:06.987170',1,1),
(462,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:09.338986',1,1),
(463,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:11.673252',1,1),
(464,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:14.194449',2,1),
(465,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:16.513349',1,1),
(466,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:19.025290',1,1),
(467,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:21.388763',1,1),
(468,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:23.795546',2,1),
(469,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:26.158813',2,1),
(470,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:28.461906',1,1),
(471,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:30.565594',2,1),
(472,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:33.003487',1,1),
(473,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:35.373727',1,1),
(474,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:37.564875',1,1),
(475,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:39.764047',1,1),
(476,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:41.977717',1,1),
(477,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:44.322321',1,1),
(478,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:46.626343',1,1),
(479,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:49.030324',1,1),
(480,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:51.255783',1,1),
(481,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:53.518348',2,1),
(482,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:55.689875',2,1),
(483,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:23:58.030666',2,1),
(484,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:00.505353',1,1),
(485,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:02.857630',2,1),
(486,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:05.010921',2,1),
(487,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:07.400811',2,1),
(488,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:09.603621',1,1),
(489,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:11.915693',1,1),
(490,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:14.254656',2,1),
(491,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:16.634488',1,1),
(492,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:18.941923',1,1),
(493,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:21.294463',2,1),
(494,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:23.558043',1,1),
(495,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:25.790745',2,1),
(496,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:28.011672',2,1),
(497,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:30.434147',2,1),
(498,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:32.698399',2,1),
(499,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:34.956589',2,1),
(500,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:37.200903',2,1),
(501,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:39.648833',2,1),
(502,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:41.828054',2,1),
(503,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:44.147251',1,1),
(504,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:46.315380',2,1),
(505,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:48.577045',1,1),
(506,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:50.805466',1,1),
(507,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:53.025053',1,1),
(508,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:55.259771',1,1),
(509,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:57.422715',1,1),
(510,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:24:59.671681',1,1),
(511,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:02.293108',2,1),
(512,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:04.557478',2,1),
(513,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:06.885158',2,1),
(514,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:09.128859',2,1),
(515,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:11.373546',1,1),
(516,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:13.720935',2,1),
(517,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:16.017702',1,1),
(518,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:18.200340',1,1),
(519,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:20.483092',1,1),
(520,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:22.726112',2,1),
(521,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:24.891324',1,1),
(522,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:27.062689',2,1),
(523,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:29.267159',1,1),
(524,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:31.593151',1,1),
(525,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:33.937365',1,1),
(526,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:36.078225',1,1),
(527,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:38.221570',2,1),
(528,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:40.415096',2,1),
(529,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:42.542023',1,1),
(530,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:44.718765',1,1),
(531,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:46.867786',2,1),
(532,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:49.078225',1,1),
(533,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:51.358397',1,1),
(534,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:53.551891',2,1),
(535,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:55.832135',2,1),
(536,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:25:58.167051',2,1),
(537,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:00.687836',1,1),
(538,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:03.221735',2,1),
(539,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:05.486935',2,1),
(540,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:07.704436',2,1),
(541,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:09.894181',1,1),
(542,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:12.128313',2,1),
(543,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:14.287944',1,1),
(544,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:16.755979',1,1),
(545,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:19.007341',2,1),
(546,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:21.226931',1,1),
(547,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:23.430730',1,1),
(548,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:25.663436',2,1),
(549,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:27.806837',2,1),
(550,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:29.977887',2,1),
(551,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:32.177249',1,1),
(552,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:34.274309',2,1),
(553,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:36.428039',2,1),
(554,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:38.608664',1,1),
(555,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:40.738149',1,1),
(556,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:42.909224',2,1),
(557,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:45.104480',2,1),
(558,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:47.289241',2,1),
(559,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:49.544560',1,1),
(560,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:51.794266',1,1),
(561,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:53.985186',2,1),
(562,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:56.228476',1,1),
(563,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:26:58.440947',2,1),
(564,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:00.793572',2,1),
(565,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:03.115463',1,1),
(566,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:05.309448',1,1),
(567,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:07.552780',1,1),
(568,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:09.737917',1,1),
(569,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:11.954875',1,1),
(570,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:14.247968',1,1),
(571,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:16.474330',2,1),
(572,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:18.771165',1,1),
(573,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:20.967429',1,1),
(574,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:23.274182',2,1),
(575,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:25.488846',2,1),
(576,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:27.657108',1,1),
(577,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:29.853537',2,1),
(578,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:32.013671',2,1),
(579,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:34.210925',2,1),
(580,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:36.510902',2,1),
(581,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:38.826090',2,1),
(582,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:41.053579',2,1),
(583,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:43.245602',2,1),
(584,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:45.395644',2,1),
(585,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:47.640403',1,1),
(586,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:49.887156',1,1),
(587,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:52.124731',2,1),
(588,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:54.374237',1,1),
(589,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:56.753589',1,1),
(590,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:27:59.322250',1,1),
(591,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:02.102300',2,1),
(592,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:04.407320',2,1),
(593,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:06.683015',1,1),
(594,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:09.005898',2,1),
(595,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:11.385022',1,1),
(596,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:13.813091',2,1),
(597,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:16.198764',1,1),
(598,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:18.477802',2,1),
(599,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:20.827005',2,1),
(600,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:23.137270',1,1),
(601,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:25.329043',2,1),
(602,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:27.566673',1,1),
(603,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:29.964101',1,1),
(604,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:32.211044',2,1),
(605,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:34.434771',2,1),
(606,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:36.685591',1,1),
(607,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:38.954970',1,1),
(608,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:41.337688',2,1),
(609,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:43.627984',2,1),
(610,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:45.888727',2,1),
(611,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:48.109679',2,1),
(612,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:50.446659',2,1),
(613,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:52.739459',1,1),
(614,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:55.013554',1,1),
(615,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:57.246916',1,1),
(616,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:28:59.602684',1,1),
(617,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:02.194078',2,1),
(618,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:04.475265',2,1),
(619,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:06.769098',2,1),
(620,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:09.266002',2,1),
(621,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:11.650007',2,1),
(622,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:13.931379',2,1),
(623,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:16.336961',1,1),
(624,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:18.586203',1,1),
(625,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:20.829915',1,1),
(626,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:23.195483',1,1),
(627,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:25.787892',2,1),
(628,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:28.182171',2,1),
(629,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:30.599949',2,1),
(630,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:32.984235',2,1),
(631,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:35.434648',2,1),
(632,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:37.705485',2,1),
(633,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:39.986861',1,1),
(634,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:42.464037',2,1),
(635,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:44.826807',2,1),
(636,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:47.202996',2,1),
(637,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:49.484767',1,1),
(638,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:51.836524',1,1),
(639,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:54.168427',1,1),
(640,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:56.585344',2,1),
(641,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:29:58.959188',1,1),
(642,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:02.633429',2,1),
(643,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:05.052353',1,1),
(644,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:07.520010',1,1),
(645,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:09.904621',1,1),
(646,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:12.261920',2,1),
(647,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:14.821108',1,1),
(648,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:17.301111',1,1),
(649,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:19.731503',1,1),
(650,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:22.059764',2,1),
(651,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:24.533003',2,1),
(652,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:26.868943',1,1),
(653,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:29.841533',1,1),
(654,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:32.785161',2,1),
(655,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:35.689451',1,1),
(656,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:38.627689',1,1),
(657,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:41.451216',1,1),
(658,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:44.549194',1,1),
(659,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:47.667170',1,1),
(660,'#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:50.686214',2,1),
(661,'#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}','CPP17','WRONG_ANSWER','2025-12-06 16:30:53.721845',1,1),
(662,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    for (int i = 0; i < N; i++) {\n        cout << \"\\\"Hello, NIMDA!\\\"\" << \'\\n\';\n    }\n\n    return 0;\n}\n','CPP17','ACCEPTED','2025-12-16 01:50:25.051054',1,8),
(663,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int N;\n    cin >> N;\n\n    for (int i = 0; i < N; i++) {\n        cout << \"\\\"Hello, NIMDA!\\\"\" << \'\\n\';\n    }\n\n    return 0;\n}\n','CPP17','ACCEPTED','2025-12-16 02:21:27.032244',1,1);
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_cases`
--

DROP TABLE IF EXISTS `test_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `input` text NOT NULL,
  `output` text NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `problem_id` bigint NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0' COMMENT '프론트엔드에 공개 여부 (true: 공개, false: 백엔드 전용)',
  PRIMARY KEY (`id`),
  KEY `FKtddrw6qnmvhxky105cag980j3` (`problem_id`),
  CONSTRAINT `FKtddrw6qnmvhxky105cag980j3` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_cases`
--

LOCK TABLES `test_cases` WRITE;
/*!40000 ALTER TABLE `test_cases` DISABLE KEYS */;
INSERT INTO `test_cases` VALUES
(31,'2025-11-24 05:20:51.775457','10 10','9 25','2025-11-24 05:20:51.775457',2,1),
(32,'2025-11-24 05:20:51.778642','0 30','23 45','2025-11-24 05:20:51.778642',2,1),
(33,'2025-11-24 05:20:51.781549','23 40','22 55','2025-11-24 05:20:51.781549',2,1),
(34,'2025-11-24 05:20:51.784807','0 45','0 0','2025-11-24 05:20:51.784807',2,0),
(35,'2025-11-24 05:20:51.787723','10 45','10 0','2025-11-24 05:20:51.787723',2,0),
(36,'2025-11-24 05:20:51.792473','0 0','23 15','2025-11-24 05:20:51.792473',2,0),
(37,'2025-11-24 05:20:51.796534','10 50','10 5','2025-11-24 05:20:51.796534',2,0),
(38,'2025-11-24 05:20:51.800733','5 44','4 59','2025-11-24 05:20:51.800733',2,0),
(39,'2025-11-24 05:20:51.804187','5 46','5 1','2025-11-24 05:20:51.804187',2,0),
(40,'2025-11-24 05:20:51.808593','1 30','0 45','2025-11-24 05:20:51.808593',2,0),
(41,'2025-11-24 05:20:51.813140','23 59','23 14','2025-11-24 05:20:51.813140',2,0),
(42,'2025-11-24 05:20:51.818356','0 1','23 16','2025-11-24 05:20:51.818356',2,0),
(43,'2025-11-24 05:20:51.823133','12 0','11 15','2025-11-24 05:20:51.823133',2,0),
(44,'2025-11-24 05:20:51.825889','0 44','23 59','2025-11-24 05:20:51.825889',2,0),
(45,'2025-11-24 05:20:51.830963','0 46','0 1','2025-11-24 05:20:51.830963',2,0),
(46,'2025-11-24 05:20:51.835721','23 45','23 0','2025-11-24 05:20:51.835721',2,0),
(47,'2025-11-24 05:20:51.840015','23 44','22 59','2025-11-24 05:20:51.840015',2,0),
(48,'2025-11-24 05:20:51.843656','4 0','3 15','2025-11-24 05:20:51.843656',2,0),
(49,'2025-11-24 05:20:51.847885','15 15','14 30','2025-11-24 05:20:51.847885',2,0),
(50,'2025-11-24 05:20:51.850022','20 20','19 35','2025-11-24 05:20:51.850022',2,0),
(53,'2025-11-24 05:26:39.055202','5 21\n5 6 7 8 9','21','2025-11-24 05:26:39.055202',3,1),
(54,NULL,'10 500\n93 181 245 214 315 36 185 138 216 295','497',NULL,3,1),
(55,NULL,'3 100\n10 20 30','60',NULL,3,0),
(56,NULL,'4 100\n10 20 30 45','95',NULL,3,0),
(57,NULL,'4 10\n1 2 3 4','9',NULL,3,0),
(58,NULL,'5 21\n1 2 3 4 14','21',NULL,3,0),
(59,NULL,'5 40\n11 12 13 14 15','40',NULL,3,0),
(60,NULL,'6 30\n1 5 10 15 20 25','30',NULL,3,0),
(61,NULL,'3 10\n3 3 3','9',NULL,3,0),
(62,NULL,'5 60\n10 20 30 40 50','60',NULL,3,0),
(63,NULL,'6 27\n1 2 3 4 5 20','27',NULL,3,0),
(64,NULL,'6 27\n8 8 8 8 8 8','24',NULL,3,0),
(65,NULL,'5 20\n10 5 4 3 2','19',NULL,3,0),
(66,NULL,'5 21\n10 9 8 2 2','21',NULL,3,0),
(67,NULL,'4 100\n30 30 30 30','90',NULL,3,0),
(68,NULL,'10 300000\n1000 2000 3000 4000 5000 6000 7000 8000 9000 100000','117000',NULL,3,0),
(69,NULL,'3 10\n1 1 1','3',NULL,3,0),
(70,NULL,'5 12\n1 2 3 4 10','9',NULL,3,0),
(71,NULL,'6 115\n10 20 80 90 95 99','110',NULL,3,0),
(72,NULL,'5 30\n1 5 10 14 15','30',NULL,3,0),
(136,'2025-11-24 05:54:25.642739','5\nRRRBB\nGGBBB\nBBBRR\nBBRRR\nRRRRR','4 3','2025-11-24 05:54:25.642739',6,1),
(137,'2025-11-24 05:54:25.646119','3\nRRG\nGBB\nBRR','6 4','2025-11-24 05:54:25.646119',6,1),
(138,'2025-11-24 05:54:25.648487','1\nR','1 1','2025-11-24 05:54:25.648487',6,0),
(139,'2025-11-24 05:54:25.651297','1\nG','1 1','2025-11-24 05:54:25.651297',6,0),
(140,'2025-11-24 05:54:25.655542','1\nB','1 1','2025-11-24 05:54:25.655542',6,0),
(141,'2025-11-24 05:54:25.658115','2\nRR\nRR','1 1','2025-11-24 05:54:25.658115',6,0),
(142,'2025-11-24 05:54:25.661262','2\nRG\nGR','4 1','2025-11-24 05:54:25.661262',6,0),
(143,'2025-11-24 05:54:25.664791','2\nRB\nBR','4 4','2025-11-24 05:54:25.664791',6,0),
(144,'2025-11-24 05:54:25.668557','3\nGGG\nGGG\nGGG','1 1','2025-11-24 05:54:25.668557',6,0),
(145,'2025-11-24 05:54:25.671801','3\nRRR\nGGG\nBBB','3 2','2025-11-24 05:54:25.671801',6,0),
(146,'2025-11-24 05:54:25.675943','3\nRGR\nGRG\nRGR','9 1','2025-11-24 05:54:25.675943',6,0),
(147,'2025-11-24 05:54:25.678841','4\nRRGG\nRRGG\nBBRR\nBBRR','4 2','2025-11-24 05:54:25.678841',6,0),
(148,'2025-11-24 05:54:25.681261','5\nRGBRG\nRGBRG\nRGBRG\nRGBRG\nRGBRG','5 3','2025-11-24 05:54:25.681261',6,0),
(149,'2025-11-24 05:54:25.685055','3\nRRR\nRGR\nRRR','2 1','2025-11-24 05:54:25.685055',6,0),
(150,'2025-11-24 05:54:25.689093','5\nBBBBB\nBBBBB\nBBBBB\nBBBBB\nBBBBB','1 1','2025-11-24 05:54:25.689093',6,0),
(151,'2025-11-24 05:54:25.691618','5\nRRRRR\nGBGBG\nRRRRR\nGBGBG\nRRRRR','13 5','2025-11-24 05:54:25.691618',6,0),
(152,'2025-11-24 05:54:25.696173','2\nGB\nBG','4 4','2025-11-24 05:54:25.696173',6,0),
(153,'2025-11-24 05:54:25.699747','3\nRGB\nGBR\nBRG','9 5','2025-11-24 05:54:25.699747',6,0),
(154,'2025-11-24 05:54:25.702368','4\nRRRR\nGGGG\nBBBB\nRRRR','4 3','2025-11-24 05:54:25.702368',6,0),
(155,'2025-11-24 05:54:25.706113','4\nRGRG\nGRGR\nRGRG\nGRGR','16 1','2025-11-24 05:54:25.706113',6,0),
(177,NULL,'4 2 0 0 8\n0 2\n3 4\n5 6\n7 8\n4 4 4 1 3 3 3 2','0\n0\n3\n0\n0\n8\n6\n3',NULL,7,1),
(178,NULL,'3 3 1 1 9\n1 2 3\n4 0 5\n6 7 8\n1 3 2 2 4 4 1 1 3','0\n0\n0\n3\n0\n1\n0\n6\n0',NULL,7,1),
(179,NULL,'1 1 0 0 4\n0\n1 2 3 4','',NULL,7,0),
(180,NULL,'1 2 0 0 2\n0 5\n1 2','0\n0',NULL,7,0),
(181,NULL,'2 1 0 0 2\n0\n0\n4 3','0\n0',NULL,7,0),
(182,NULL,'2 2 0 0 4\n0 0\n0 0\n1 4 2 3','0\n0\n0\n0',NULL,7,0),
(183,NULL,'1 3 0 0 4\n0 0 5\n1 1 2 2','0\n0\n0\n5',NULL,7,0),
(184,NULL,'2 2 0 0 3\n0 0\n0 0\n3 2 1','0',NULL,7,0),
(185,NULL,'1 2 0 0 4\n0 0\n1 2 1 2','0\n0\n0\n0',NULL,7,0),
(186,NULL,'1 2 0 0 3\n0 9\n1 2 1','0\n0\n0',NULL,7,0),
(187,NULL,'3 1 0 0 4\n0\n0\n7\n4 4 3 3','0\n0\n0\n7',NULL,7,0),
(188,NULL,'2 2 0 0 4\n0 0\n0 0\n1 4 2 3','0\n0\n0\n0',NULL,7,0),
(189,NULL,'1 2 0 0 2\n0 0\n1 2','0\n0',NULL,7,0),
(190,NULL,'1 1 0 0 10\n0\n1 2 3 4 1 2 3 4 1 2','',NULL,7,0),
(191,NULL,'2 2 0 0 2\n0 3\n0 0\n1 4','0\n0',NULL,7,0),
(192,NULL,'1 2 0 0 3\n0 9\n1 2 1','0\n0\n0',NULL,7,0),
(193,NULL,'2 1 1 0 3\n8\n0\n3 4 3','0\n0\n0',NULL,7,0),
(194,NULL,'2 2 1 1 2\n0 0\n0 0\n1 4','',NULL,7,0),
(195,NULL,'1 5 0 0 4\n0 0 0 0 0\n1 1 1 1','0\n0\n0\n0',NULL,7,0),
(196,NULL,'1 3 0 0 2\n0 5 0\n1 1','0\n0',NULL,7,0),
(197,NULL,'1 3 0 2 4\n0 0 7\n2 1 2 2','0\n0\n0\n7',NULL,7,0),
(198,NULL,'3 1 0 0 4\n0\n0\n9\n4 4 3 3','0\n0\n0\n9',NULL,7,0),
(199,NULL,'1 2 0 0 4\n0 5\n1 2 1 2','0\n0\n0\n0',NULL,7,0),
(200,NULL,'2 2 0 0 4\n0 2\n3 0\n1 4 2 3','0\n0\n0\n0',NULL,7,0),
(201,NULL,'1 4 0 0 6\n0 0 0 8\n1 1 1 2 2 2','0\n0\n0\n0\n8\n0',NULL,7,0),
(202,'2025-11-26 11:24:30.142535','4\n3\n0\n4\n0','0','2025-11-26 11:24:30.142535',4,1),
(203,'2025-11-26 11:24:30.156447','10\n1\n3\n5\n4\n0\n0\n7\n0\n0\n6','7','2025-11-26 11:24:30.156447',4,1),
(204,'2025-11-26 11:24:30.158891','5\n1\n2\n3\n4\n5','15','2025-11-26 11:24:30.158891',4,0),
(205,'2025-11-26 11:24:30.161166','6\n10\n20\n30\n0\n0\n0','0','2025-11-26 11:24:30.161166',4,0),
(206,'2025-11-26 11:24:30.164010','1\n100','100','2025-11-26 11:24:30.164010',4,0),
(207,'2025-11-26 11:24:30.166367','6\n1\n0\n2\n0\n3\n0','0','2025-11-26 11:24:30.166367',4,0),
(208,'2025-11-26 11:24:30.168658','10\n10\n0\n20\n20\n0\n30\n0\n40\n50\n0','60','2025-11-26 11:24:30.168658',4,0),
(209,'2025-11-26 11:24:30.171085','4\n100000\n100000\n0\n100000','200000','2025-11-26 11:24:30.171085',4,0),
(210,'2025-11-26 11:24:30.174221','3\n5\n7\n0','5','2025-11-26 11:24:30.174221',4,0),
(211,'2025-11-26 11:24:30.179076','5\n1\n2\n0\n3\n0','1','2025-11-26 11:24:30.179076',4,0),
(212,'2025-11-26 11:24:30.181481','4\n10\n0\n20\n0','0','2025-11-26 11:24:30.181481',4,0),
(213,'2025-11-26 11:24:30.184911','5\n1\n0\n2\n0\n5','5','2025-11-26 11:24:30.184911',4,0),
(214,'2025-11-26 11:24:30.188960','7\n1\n2\n3\n4\n0\n0\n0','1','2025-11-26 11:24:30.188960',4,0),
(215,'2025-11-26 11:24:30.193069','6\n1\n2\n3\n4\n5\n6','21','2025-11-26 11:24:30.193069',4,0),
(216,'2025-11-26 11:24:30.196573','8\n1\n2\n0\n0\n3\n4\n0\n0','0','2025-11-26 11:24:30.196573',4,0),
(217,'2025-11-26 11:24:30.199057','5\n10\n20\n30\n0\n0','10','2025-11-26 11:24:30.199057',4,0),
(218,'2025-11-26 11:24:30.201714','2\n50\n50','100','2025-11-26 11:24:30.201714',4,0),
(219,'2025-11-26 11:24:30.204276','6\n100\n0\n200\n0\n300\n0','0','2025-11-26 11:24:30.204276',4,0),
(220,'2025-11-26 11:24:30.207516','4\n1\n1\n1\n1','4','2025-11-26 11:24:30.207516',4,0),
(221,'2025-11-26 11:24:30.211928','10\n1\n0\n1\n0\n1\n0\n1\n0\n1\n0','0','2025-11-26 11:24:30.211928',4,0),
(262,NULL,'6 7 3\n.......\n...O...\n....O..\n.......\nOO.....\nOO.....','OOO.OOO\nOO...OO\nOOO...O\n..OO.OO\n...OOOO\n...OOOO',NULL,5,1),
(263,NULL,'6 7 4\n.......\n...O...\n....O..\n.......\nOO.....\nOO.....','OOOOOOO\nOOOOOOO\nOOOOOOO\nOOOOOOO\nOOOOOOO\nOOOOOOO',NULL,5,1),
(264,NULL,'3 3 1\nO..\n.O.\n..O','O..\n.O.\n..O',NULL,5,0),
(265,NULL,'3 3 2\n...\n...\n...','OOO\nOOO\nOOO',NULL,5,0),
(266,NULL,'5 5 6\nO.O.O\n.O.O.\nO.O.O\n.O.O.\nO.O.O','OOOOO\nOOOOO\nOOOOO\nOOOOO\nOOOOO',NULL,5,0),
(267,NULL,'3 3 3\nO..\n.O.\n..O','..O\n...\nO..',NULL,5,0),
(268,NULL,'3 3 5\nO..\n.O.\n..O','O..\n.O.\n..O',NULL,5,0),
(269,NULL,'3 3 3\n.O.\nOOO\n.O.','...\n...\n...',NULL,5,0),
(270,NULL,'3 3 5\n.O.\nOOO\n.O.','OOO\nOOO\nOOO',NULL,5,0),
(271,NULL,'2 2 3\n..\n..','OO\nOO',NULL,5,0),
(272,NULL,'2 2 5\n..\n..','..\n..',NULL,5,0),
(273,NULL,'2 2 3\nOO\nOO','..\n..',NULL,5,0),
(274,NULL,'2 2 5\nOO\nOO','OO\nOO',NULL,5,0),
(275,NULL,'1 1 3\nO','.',NULL,5,0),
(276,NULL,'1 1 3\n.','O',NULL,5,0),
(277,NULL,'1 3 3\nO.O','...',NULL,5,0),
(278,NULL,'1 3 5\nO.O','OOO',NULL,5,0),
(279,NULL,'2 2 3\nO.\n..','..\n.O',NULL,5,0),
(280,NULL,'4 4 200\nO..O\n.OO.\n.OO.\nO..O','OOOO\nOOOO\nOOOO\nOOOO',NULL,5,0),
(281,NULL,'1 4 199\nO...','..OO',NULL,5,0),
(282,'2025-11-26 12:15:49.522153','3','\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"','2025-11-26 12:15:49.522153',1,1),
(283,'2025-11-26 12:15:49.533226','1','\"Hello, NIMDA!\"','2025-11-26 12:15:49.533226',1,1),
(284,'2025-11-26 12:15:49.535434','10','\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"\n\"Hello, NIMDA!\"','2025-11-26 12:15:49.535434',1,1);
/*!40000 ALTER TABLE `test_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_authorities`
--

DROP TABLE IF EXISTS `user_authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_authorities` (
  `user_id` bigint NOT NULL,
  `authority_name` varchar(50) NOT NULL,
  PRIMARY KEY (`user_id`,`authority_name`),
  KEY `FKt0v284lkdhyasl7s6hyti68i4` (`authority_name`),
  CONSTRAINT `FKhiiib540jf74gksgb87oofni` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKt0v284lkdhyasl7s6hyti68i4` FOREIGN KEY (`authority_name`) REFERENCES `authority` (`authority_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_authorities`
--

LOCK TABLES `user_authorities` WRITE;
/*!40000 ALTER TABLE `user_authorities` DISABLE KEYS */;
INSERT INTO `user_authorities` VALUES
(7,'ROLE_ADMIN'),
(8,'ROLE_ADMIN'),
(9,'ROLE_ADMIN');
/*!40000 ALTER TABLE `user_authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `nickname` varchar(255) NOT NULL,
  `university_name` varchar(100) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'team1@gmail.com','$2a$10$womCQrgYbPaVfuscSHHx6uZhy.ir913SD9a1vUuygdZXs3Hl3qNcW',NULL,NULL,'TEAM1',NULL,'team1'),
(2,'team2@gmail.com','$2a$10$A7/I.F9OrLz9p6rzgmbiH.r8ZmlN49MDGVXi6MdfPo1BVyOItaAy2',NULL,NULL,'TEAM2',NULL,'team2'),
(3,'team3@gmail.com','$2a$10$64MIxMnrYaKZVI/wAuIwEu2a4QKY/EdstEHm.WP8o43unPH5Q.I.q',NULL,NULL,'TEAM3',NULL,'team3'),
(4,'team4@gmail.com','$2a$10$So8t5mrY45IjJu9XmwUn2e4DVO5IZwnmmGplQLUI6MXidJyel5dp.',NULL,NULL,'TEAM4',NULL,'team4'),
(5,'team5@gmail.com','$2a$10$2jEBD9.aLu7XrZfgGENZFOwsDWrzmd1ouuSyK24Rgn1fhm1gtJv/2',NULL,NULL,'TEAM5',NULL,'team5'),
(6,'team6@gmail.com','$2a$10$6LVd8ctw4sA5r8uaHz1nGOG7LUISlDgQh7AUUSV7sRsrjvsp5qjgK',NULL,NULL,'TEAM6',NULL,'team6'),
(7,'seoyun@gmail.com','$2a$10$XWPELAOd3L0xlPTSmR5Xb.FRXASsXDqtMyVadAgOnqLP1HtHhkCL2',NULL,NULL,'seoyun',NULL,'seoyun'),
(8,'yknows@gmail.com','$2a$10$.qpMG1ydlFOVgWKsOSYrdu4.qzU17CZ2bQOYE3Ll2VLB2l0c1jInm',NULL,NULL,'friedchicken',NULL,'yknows'),
(9,'doil@gmail.com','$2a$10$g/8AHATmH65D8O87AFTTQ.epNWEoePscCNRyR5Xppyhwi2KvPAhCu',NULL,NULL,'nov',NULL,'doil'),
(10,'test@test.com','$2a$10$zs87hsHqMioEscwQG1MMsuACGiMurtR4lYEZVNc2N3w6rFOtNuLwu',NULL,NULL,'스유니',NULL,'nuyoes');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `word`
--

DROP TABLE IF EXISTS `word`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `word` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `example` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `translation` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `word` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `word`
--

LOCK TABLES `word` WRITE;
/*!40000 ALTER TABLE `word` DISABLE KEYS */;
INSERT INTO `word` VALUES
(15,'2025-11-30 11:16:33.509506','プログラム','','프로그램','2025-11-30 11:16:33.509506','anonymous','プログラム'),
(16,'2025-11-30 11:16:41.474847','最新情報','','최신정보','2025-11-30 11:16:41.474847','anonymous','最新情報'),
(17,'2025-12-19 05:16:55.803587','書くことです','','글을 쓰는 것이다','2025-12-19 05:16:55.803587','anonymous','書くことです');
/*!40000 ALTER TABLE `word` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-04 11:21:18
