/*
 Navicat Premium Data Transfer

 Source Server         : feishu-work
 Source Server Type    : MySQL
 Source Server Version : 50744
 Source Host           : 43.143.44.5:3306
 Source Schema         : feishu-work

 Target Server Type    : MySQL
 Target Server Version : 50744
 File Encoding         : 65001

 Date: 07/08/2026 13:48:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `admin_open_id_key`(`open_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` VALUES (1, 'ou_f82a897a24d387dc1346fbe2bb1b4a83', '李志祥', '2026-08-04 09:39:55.491');
INSERT INTO `admin` VALUES (3, 'ou_29fa6e21867e0a15c780722094e33001', '林超', '2026-08-04 01:42:58.142');

-- ----------------------------
-- Table structure for audit_log
-- ----------------------------
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `operator_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `operator_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `action` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int(11) NULL DEFAULT NULL,
  `detail` json NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `audit_log_target_type_target_id_idx`(`target_type`, `target_id`) USING BTREE,
  INDEX `audit_log_operator_open_id_idx`(`operator_open_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_log
-- ----------------------------

-- ----------------------------
-- Table structure for calendar_rule
-- ----------------------------
DROP TABLE IF EXISTS `calendar_rule`;
CREATE TABLE `calendar_rule`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cal_date` date NOT NULL,
  `day_type` int(11) NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `source` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `calendar_rule_cal_date_key`(`cal_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 349 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of calendar_rule
-- ----------------------------
INSERT INTO `calendar_rule` VALUES (96, '2020-01-01', 1, '元旦', 'json', '2026-08-07 01:31:29.461', '2026-08-07 01:31:29.461');
INSERT INTO `calendar_rule` VALUES (97, '2020-01-19', 2, '春节补班', 'json', '2026-08-07 01:31:29.718', '2026-08-07 01:31:29.718');
INSERT INTO `calendar_rule` VALUES (98, '2020-01-24', 1, '春节', 'json', '2026-08-07 01:31:30.191', '2026-08-07 01:31:30.191');
INSERT INTO `calendar_rule` VALUES (99, '2020-01-25', 1, '春节', 'json', '2026-08-07 01:31:30.425', '2026-08-07 01:31:30.425');
INSERT INTO `calendar_rule` VALUES (100, '2020-01-26', 1, '春节', 'json', '2026-08-07 01:31:30.717', '2026-08-07 01:31:30.717');
INSERT INTO `calendar_rule` VALUES (101, '2020-01-27', 1, '春节', 'json', '2026-08-07 01:31:31.009', '2026-08-07 01:31:31.009');
INSERT INTO `calendar_rule` VALUES (102, '2020-01-28', 1, '春节', 'json', '2026-08-07 01:31:31.117', '2026-08-07 01:31:31.117');
INSERT INTO `calendar_rule` VALUES (103, '2020-01-29', 1, '春节', 'json', '2026-08-07 01:31:31.549', '2026-08-07 01:31:31.549');
INSERT INTO `calendar_rule` VALUES (104, '2020-01-30', 1, '春节', 'json', '2026-08-07 01:31:31.663', '2026-08-07 01:31:31.663');
INSERT INTO `calendar_rule` VALUES (105, '2020-01-31', 1, '春节', 'json', '2026-08-07 01:31:32.016', '2026-08-07 01:31:32.016');
INSERT INTO `calendar_rule` VALUES (106, '2020-02-01', 1, '春节', 'json', '2026-08-07 01:31:32.206', '2026-08-07 01:31:32.206');
INSERT INTO `calendar_rule` VALUES (107, '2020-04-04', 1, '清明节', 'json', '2026-08-07 01:31:32.507', '2026-08-07 01:31:32.507');
INSERT INTO `calendar_rule` VALUES (108, '2020-04-05', 1, '清明节', 'json', '2026-08-07 01:31:32.746', '2026-08-07 01:31:32.746');
INSERT INTO `calendar_rule` VALUES (109, '2020-04-06', 1, '清明节', 'json', '2026-08-07 01:31:33.151', '2026-08-07 01:31:33.151');
INSERT INTO `calendar_rule` VALUES (110, '2020-04-26', 2, '劳动节补班', 'json', '2026-08-07 01:31:33.555', '2026-08-07 01:31:33.555');
INSERT INTO `calendar_rule` VALUES (111, '2020-05-01', 1, '劳动节', 'json', '2026-08-07 01:31:33.965', '2026-08-07 01:31:33.965');
INSERT INTO `calendar_rule` VALUES (112, '2020-05-02', 1, '劳动节', 'json', '2026-08-07 01:31:34.260', '2026-08-07 01:31:34.260');
INSERT INTO `calendar_rule` VALUES (113, '2020-05-03', 1, '劳动节', 'json', '2026-08-07 01:31:34.373', '2026-08-07 01:31:34.373');
INSERT INTO `calendar_rule` VALUES (114, '2020-05-04', 1, '劳动节', 'json', '2026-08-07 01:31:34.481', '2026-08-07 01:31:34.481');
INSERT INTO `calendar_rule` VALUES (115, '2020-05-05', 1, '劳动节', 'json', '2026-08-07 01:31:34.590', '2026-08-07 01:31:34.590');
INSERT INTO `calendar_rule` VALUES (116, '2020-05-09', 2, '劳动节补班', 'json', '2026-08-07 01:31:34.703', '2026-08-07 01:31:34.703');
INSERT INTO `calendar_rule` VALUES (117, '2020-06-25', 1, '端午节', 'json', '2026-08-07 01:31:34.809', '2026-08-07 01:31:34.809');
INSERT INTO `calendar_rule` VALUES (118, '2020-06-26', 1, '端午节', 'json', '2026-08-07 01:31:34.913', '2026-08-07 01:31:34.913');
INSERT INTO `calendar_rule` VALUES (119, '2020-06-27', 1, '端午节', 'json', '2026-08-07 01:31:35.019', '2026-08-07 01:31:35.019');
INSERT INTO `calendar_rule` VALUES (120, '2020-06-28', 2, '端午节补班', 'json', '2026-08-07 01:31:35.121', '2026-08-07 01:31:35.121');
INSERT INTO `calendar_rule` VALUES (121, '2020-09-27', 2, '国庆节和中秋节补班', 'json', '2026-08-07 01:31:35.225', '2026-08-07 01:31:35.225');
INSERT INTO `calendar_rule` VALUES (122, '2020-10-01', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.339', '2026-08-07 01:31:35.339');
INSERT INTO `calendar_rule` VALUES (123, '2020-10-02', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.448', '2026-08-07 01:31:35.448');
INSERT INTO `calendar_rule` VALUES (124, '2020-10-03', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.563', '2026-08-07 01:31:35.563');
INSERT INTO `calendar_rule` VALUES (125, '2020-10-04', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.676', '2026-08-07 01:31:35.676');
INSERT INTO `calendar_rule` VALUES (126, '2020-10-05', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.806', '2026-08-07 01:31:35.806');
INSERT INTO `calendar_rule` VALUES (127, '2020-10-06', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:35.909', '2026-08-07 01:31:35.909');
INSERT INTO `calendar_rule` VALUES (128, '2020-10-07', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:36.013', '2026-08-07 01:31:36.013');
INSERT INTO `calendar_rule` VALUES (129, '2020-10-08', 1, '国庆节和中秋节', 'json', '2026-08-07 01:31:36.123', '2026-08-07 01:31:36.123');
INSERT INTO `calendar_rule` VALUES (130, '2020-10-10', 2, '国庆节和中秋节补班', 'json', '2026-08-07 01:31:36.225', '2026-08-07 01:31:36.225');
INSERT INTO `calendar_rule` VALUES (131, '2021-01-01', 1, '元旦', 'json', '2026-08-07 01:31:39.352', '2026-08-07 01:32:01.921');
INSERT INTO `calendar_rule` VALUES (132, '2021-01-02', 1, '元旦', 'json', '2026-08-07 01:31:39.810', '2026-08-07 01:32:02.330');
INSERT INTO `calendar_rule` VALUES (133, '2021-01-03', 1, '元旦', 'json', '2026-08-07 01:31:40.110', '2026-08-07 01:32:02.637');
INSERT INTO `calendar_rule` VALUES (134, '2021-02-07', 2, '春节补班', 'json', '2026-08-07 01:31:40.360', '2026-08-07 01:32:02.932');
INSERT INTO `calendar_rule` VALUES (135, '2021-02-11', 1, '春节', 'json', '2026-08-07 01:31:40.620', '2026-08-07 01:32:03.150');
INSERT INTO `calendar_rule` VALUES (136, '2021-02-12', 1, '春节', 'json', '2026-08-07 01:31:41.133', '2026-08-07 01:32:03.500');
INSERT INTO `calendar_rule` VALUES (137, '2021-02-13', 1, '春节', 'json', '2026-08-07 01:31:41.472', '2026-08-07 01:32:03.762');
INSERT INTO `calendar_rule` VALUES (138, '2021-02-14', 1, '春节', 'json', '2026-08-07 01:31:41.661', '2026-08-07 01:32:03.971');
INSERT INTO `calendar_rule` VALUES (139, '2021-02-15', 1, '春节', 'json', '2026-08-07 01:31:42.157', '2026-08-07 01:32:04.377');
INSERT INTO `calendar_rule` VALUES (140, '2021-02-16', 1, '春节', 'json', '2026-08-07 01:31:42.465', '2026-08-07 01:32:04.539');
INSERT INTO `calendar_rule` VALUES (141, '2021-02-17', 1, '春节', 'json', '2026-08-07 01:31:42.779', '2026-08-07 01:32:04.662');
INSERT INTO `calendar_rule` VALUES (142, '2021-02-20', 2, '春节补班', 'json', '2026-08-07 01:31:43.284', '2026-08-07 01:32:04.772');
INSERT INTO `calendar_rule` VALUES (143, '2021-04-03', 1, '清明节', 'json', '2026-08-07 01:31:43.692', '2026-08-07 01:32:04.877');
INSERT INTO `calendar_rule` VALUES (144, '2021-04-04', 1, '清明节', 'json', '2026-08-07 01:31:44.197', '2026-08-07 01:32:04.983');
INSERT INTO `calendar_rule` VALUES (145, '2021-04-05', 1, '清明节', 'json', '2026-08-07 01:31:44.478', '2026-08-07 01:32:05.084');
INSERT INTO `calendar_rule` VALUES (146, '2021-04-25', 2, '劳动节补班', 'json', '2026-08-07 01:31:44.750', '2026-08-07 01:32:05.190');
INSERT INTO `calendar_rule` VALUES (147, '2021-05-01', 1, '劳动节', 'json', '2026-08-07 01:31:45.127', '2026-08-07 01:32:05.295');
INSERT INTO `calendar_rule` VALUES (148, '2021-05-02', 1, '劳动节', 'json', '2026-08-07 01:31:45.740', '2026-08-07 01:32:05.399');
INSERT INTO `calendar_rule` VALUES (149, '2021-05-03', 1, '劳动节', 'json', '2026-08-07 01:31:46.252', '2026-08-07 01:32:05.502');
INSERT INTO `calendar_rule` VALUES (150, '2021-05-04', 1, '劳动节', 'json', '2026-08-07 01:31:46.764', '2026-08-07 01:32:05.606');
INSERT INTO `calendar_rule` VALUES (151, '2021-05-05', 1, '劳动节', 'json', '2026-08-07 01:31:47.276', '2026-08-07 01:32:05.718');
INSERT INTO `calendar_rule` VALUES (152, '2021-05-08', 2, '劳动节补班', 'json', '2026-08-07 01:31:47.790', '2026-08-07 01:32:05.825');
INSERT INTO `calendar_rule` VALUES (153, '2021-06-12', 1, '端午节', 'json', '2026-08-07 01:31:48.300', '2026-08-07 01:32:05.930');
INSERT INTO `calendar_rule` VALUES (154, '2021-06-13', 1, '端午节', 'json', '2026-08-07 01:31:48.712', '2026-08-07 01:32:06.034');
INSERT INTO `calendar_rule` VALUES (155, '2021-06-14', 1, '端午节', 'json', '2026-08-07 01:31:49.018', '2026-08-07 01:32:06.141');
INSERT INTO `calendar_rule` VALUES (156, '2021-09-18', 2, '中秋节补班', 'json', '2026-08-07 01:31:49.418', '2026-08-07 01:32:06.246');
INSERT INTO `calendar_rule` VALUES (157, '2021-09-19', 1, '中秋节', 'json', '2026-08-07 01:31:49.836', '2026-08-07 01:32:06.350');
INSERT INTO `calendar_rule` VALUES (158, '2021-09-20', 1, '中秋节', 'json', '2026-08-07 01:31:50.120', '2026-08-07 01:32:06.459');
INSERT INTO `calendar_rule` VALUES (159, '2021-09-21', 1, '中秋节', 'json', '2026-08-07 01:31:50.554', '2026-08-07 01:32:06.567');
INSERT INTO `calendar_rule` VALUES (160, '2021-09-26', 2, '国庆节补班', 'json', '2026-08-07 01:31:50.963', '2026-08-07 01:32:06.673');
INSERT INTO `calendar_rule` VALUES (161, '2021-10-01', 1, '国庆节', 'json', '2026-08-07 01:31:51.373', '2026-08-07 01:32:06.779');
INSERT INTO `calendar_rule` VALUES (162, '2021-10-02', 1, '国庆节', 'json', '2026-08-07 01:31:51.798', '2026-08-07 01:32:06.888');
INSERT INTO `calendar_rule` VALUES (163, '2021-10-03', 1, '国庆节', 'json', '2026-08-07 01:31:52.192', '2026-08-07 01:32:06.997');
INSERT INTO `calendar_rule` VALUES (164, '2021-10-04', 1, '国庆节', 'json', '2026-08-07 01:31:52.505', '2026-08-07 01:32:07.105');
INSERT INTO `calendar_rule` VALUES (165, '2021-10-05', 1, '国庆节', 'json', '2026-08-07 01:31:52.962', '2026-08-07 01:32:07.213');
INSERT INTO `calendar_rule` VALUES (166, '2021-10-06', 1, '国庆节', 'json', '2026-08-07 01:31:53.420', '2026-08-07 01:32:07.321');
INSERT INTO `calendar_rule` VALUES (167, '2021-10-07', 1, '国庆节', 'json', '2026-08-07 01:31:53.933', '2026-08-07 01:32:07.428');
INSERT INTO `calendar_rule` VALUES (168, '2021-10-09', 2, '国庆节补班', 'json', '2026-08-07 01:31:54.649', '2026-08-07 01:32:07.536');
INSERT INTO `calendar_rule` VALUES (169, '2022-01-01', 1, '元旦', 'json', '2026-08-07 01:32:15.933', '2026-08-07 01:33:20.549');
INSERT INTO `calendar_rule` VALUES (170, '2022-01-02', 1, '元旦', 'json', '2026-08-07 01:32:16.359', '2026-08-07 01:33:20.649');
INSERT INTO `calendar_rule` VALUES (171, '2022-01-03', 1, '元旦', 'json', '2026-08-07 01:32:16.871', '2026-08-07 01:33:20.742');
INSERT INTO `calendar_rule` VALUES (172, '2022-01-29', 2, '春节补班', 'json', '2026-08-07 01:32:17.256', '2026-08-07 01:33:20.840');
INSERT INTO `calendar_rule` VALUES (173, '2022-01-30', 2, '春节补班', 'json', '2026-08-07 01:32:17.525', '2026-08-07 01:33:20.937');
INSERT INTO `calendar_rule` VALUES (174, '2022-01-31', 1, '春节', 'json', '2026-08-07 01:32:17.893', '2026-08-07 01:33:21.276');
INSERT INTO `calendar_rule` VALUES (175, '2022-02-01', 1, '春节', 'json', '2026-08-07 01:32:18.192', '2026-08-07 01:33:21.790');
INSERT INTO `calendar_rule` VALUES (176, '2022-02-02', 1, '春节', 'json', '2026-08-07 01:32:18.535', '2026-08-07 01:33:22.098');
INSERT INTO `calendar_rule` VALUES (177, '2022-02-03', 1, '春节', 'json', '2026-08-07 01:32:18.919', '2026-08-07 01:33:22.304');
INSERT INTO `calendar_rule` VALUES (178, '2022-02-04', 1, '春节', 'json', '2026-08-07 01:32:19.424', '2026-08-07 01:33:22.506');
INSERT INTO `calendar_rule` VALUES (179, '2022-02-05', 1, '春节', 'json', '2026-08-07 01:32:19.737', '2026-08-07 01:33:22.666');
INSERT INTO `calendar_rule` VALUES (180, '2022-02-06', 1, '春节', 'json', '2026-08-07 01:32:20.147', '2026-08-07 01:33:22.916');
INSERT INTO `calendar_rule` VALUES (181, '2022-04-02', 2, '清明节补班', 'json', '2026-08-07 01:32:20.351', '2026-08-07 01:33:23.224');
INSERT INTO `calendar_rule` VALUES (182, '2022-04-03', 1, '清明节', 'json', '2026-08-07 01:32:20.671', '2026-08-07 01:33:23.428');
INSERT INTO `calendar_rule` VALUES (183, '2022-04-04', 1, '清明节', 'json', '2026-08-07 01:32:20.980', '2026-08-07 01:33:23.787');
INSERT INTO `calendar_rule` VALUES (184, '2022-04-05', 1, '清明节', 'json', '2026-08-07 01:32:21.682', '2026-08-07 01:33:24.146');
INSERT INTO `calendar_rule` VALUES (185, '2022-04-24', 2, '劳动节补班', 'json', '2026-08-07 01:32:22.192', '2026-08-07 01:33:24.452');
INSERT INTO `calendar_rule` VALUES (186, '2022-04-30', 1, '劳动节', 'json', '2026-08-07 01:32:22.714', '2026-08-07 01:33:24.863');
INSERT INTO `calendar_rule` VALUES (187, '2022-05-01', 1, '劳动节', 'json', '2026-08-07 01:32:22.810', '2026-08-07 01:33:24.982');
INSERT INTO `calendar_rule` VALUES (188, '2022-05-02', 1, '劳动节', 'json', '2026-08-07 01:32:23.397', '2026-08-07 01:33:25.128');
INSERT INTO `calendar_rule` VALUES (189, '2022-05-03', 1, '劳动节', 'json', '2026-08-07 01:32:23.861', '2026-08-07 01:33:25.221');
INSERT INTO `calendar_rule` VALUES (190, '2022-05-04', 1, '劳动节', 'json', '2026-08-07 01:32:24.245', '2026-08-07 01:33:25.317');
INSERT INTO `calendar_rule` VALUES (191, '2022-05-07', 2, '劳动节补班', 'json', '2026-08-07 01:32:24.516', '2026-08-07 01:33:25.419');
INSERT INTO `calendar_rule` VALUES (192, '2022-06-03', 1, '端午节', 'json', '2026-08-07 01:32:24.747', '2026-08-07 01:33:25.514');
INSERT INTO `calendar_rule` VALUES (193, '2022-06-04', 1, '端午节', 'json', '2026-08-07 01:32:24.959', '2026-08-07 01:33:25.611');
INSERT INTO `calendar_rule` VALUES (194, '2022-06-05', 1, '端午节', 'json', '2026-08-07 01:32:25.471', '2026-08-07 01:33:25.703');
INSERT INTO `calendar_rule` VALUES (195, '2022-09-10', 1, '中秋节', 'json', '2026-08-07 01:32:25.587', '2026-08-07 01:33:25.798');
INSERT INTO `calendar_rule` VALUES (196, '2022-09-11', 1, '中秋节', 'json', '2026-08-07 01:32:25.968', '2026-08-07 01:33:25.895');
INSERT INTO `calendar_rule` VALUES (197, '2022-09-12', 1, '中秋节', 'json', '2026-08-07 01:32:26.291', '2026-08-07 01:33:25.995');
INSERT INTO `calendar_rule` VALUES (198, '2022-10-01', 1, '国庆节', 'json', '2026-08-07 01:32:26.678', '2026-08-07 01:33:26.098');
INSERT INTO `calendar_rule` VALUES (199, '2022-10-02', 1, '国庆节', 'json', '2026-08-07 01:32:26.914', '2026-08-07 01:33:26.189');
INSERT INTO `calendar_rule` VALUES (200, '2022-10-03', 1, '国庆节', 'json', '2026-08-07 01:32:27.212', '2026-08-07 01:33:26.286');
INSERT INTO `calendar_rule` VALUES (201, '2022-10-04', 1, '国庆节', 'json', '2026-08-07 01:32:27.622', '2026-08-07 01:33:26.381');
INSERT INTO `calendar_rule` VALUES (202, '2022-10-05', 1, '国庆节', 'json', '2026-08-07 01:32:27.827', '2026-08-07 01:33:26.484');
INSERT INTO `calendar_rule` VALUES (203, '2022-10-06', 1, '国庆节', 'json', '2026-08-07 01:32:28.237', '2026-08-07 01:33:26.575');
INSERT INTO `calendar_rule` VALUES (204, '2022-10-07', 1, '国庆节', 'json', '2026-08-07 01:32:28.721', '2026-08-07 01:33:26.668');
INSERT INTO `calendar_rule` VALUES (205, '2022-10-08', 2, '国庆节补班', 'json', '2026-08-07 01:32:29.567', '2026-08-07 01:33:26.760');
INSERT INTO `calendar_rule` VALUES (206, '2022-10-09', 2, '国庆节补班', 'json', '2026-08-07 01:32:29.875', '2026-08-07 01:33:26.858');
INSERT INTO `calendar_rule` VALUES (207, '2022-12-31', 1, '元旦', 'json', '2026-08-07 01:33:33.761', '2026-08-07 01:33:33.761');
INSERT INTO `calendar_rule` VALUES (208, '2023-01-01', 1, '元旦', 'json', '2026-08-07 01:33:33.996', '2026-08-07 01:33:33.996');
INSERT INTO `calendar_rule` VALUES (209, '2023-01-02', 1, '元旦', 'json', '2026-08-07 01:33:34.291', '2026-08-07 01:33:34.291');
INSERT INTO `calendar_rule` VALUES (210, '2023-01-21', 1, '春节', 'json', '2026-08-07 01:33:34.479', '2026-08-07 01:33:34.479');
INSERT INTO `calendar_rule` VALUES (211, '2023-01-22', 1, '春节', 'json', '2026-08-07 01:33:34.692', '2026-08-07 01:33:34.692');
INSERT INTO `calendar_rule` VALUES (212, '2023-01-23', 1, '春节', 'json', '2026-08-07 01:33:34.806', '2026-08-07 01:33:34.806');
INSERT INTO `calendar_rule` VALUES (213, '2023-01-24', 1, '春节', 'json', '2026-08-07 01:33:34.940', '2026-08-07 01:33:34.940');
INSERT INTO `calendar_rule` VALUES (214, '2023-01-25', 1, '春节', 'json', '2026-08-07 01:33:35.087', '2026-08-07 01:33:35.087');
INSERT INTO `calendar_rule` VALUES (215, '2023-01-26', 1, '春节', 'json', '2026-08-07 01:33:35.186', '2026-08-07 01:33:35.186');
INSERT INTO `calendar_rule` VALUES (216, '2023-01-27', 1, '春节', 'json', '2026-08-07 01:33:35.279', '2026-08-07 01:33:35.279');
INSERT INTO `calendar_rule` VALUES (217, '2023-01-28', 2, '春节补班', 'json', '2026-08-07 01:33:35.377', '2026-08-07 01:33:35.377');
INSERT INTO `calendar_rule` VALUES (218, '2023-01-29', 2, '春节补班', 'json', '2026-08-07 01:33:35.474', '2026-08-07 01:33:35.474');
INSERT INTO `calendar_rule` VALUES (219, '2023-04-05', 1, '清明节', 'json', '2026-08-07 01:33:35.570', '2026-08-07 01:33:35.570');
INSERT INTO `calendar_rule` VALUES (220, '2023-04-23', 2, '劳动节补班', 'json', '2026-08-07 01:33:35.675', '2026-08-07 01:33:35.675');
INSERT INTO `calendar_rule` VALUES (221, '2023-04-29', 1, '劳动节', 'json', '2026-08-07 01:33:35.772', '2026-08-07 01:33:35.772');
INSERT INTO `calendar_rule` VALUES (222, '2023-04-30', 1, '劳动节', 'json', '2026-08-07 01:33:35.867', '2026-08-07 01:33:35.867');
INSERT INTO `calendar_rule` VALUES (223, '2023-05-01', 1, '劳动节', 'json', '2026-08-07 01:33:35.963', '2026-08-07 01:33:35.963');
INSERT INTO `calendar_rule` VALUES (224, '2023-05-02', 1, '劳动节', 'json', '2026-08-07 01:33:36.057', '2026-08-07 01:33:36.057');
INSERT INTO `calendar_rule` VALUES (225, '2023-05-03', 1, '劳动节', 'json', '2026-08-07 01:33:36.151', '2026-08-07 01:33:36.151');
INSERT INTO `calendar_rule` VALUES (226, '2023-05-06', 2, '劳动节补班', 'json', '2026-08-07 01:33:36.248', '2026-08-07 01:33:36.248');
INSERT INTO `calendar_rule` VALUES (227, '2023-06-22', 1, '端午节', 'json', '2026-08-07 01:33:36.343', '2026-08-07 01:33:36.343');
INSERT INTO `calendar_rule` VALUES (228, '2023-06-23', 1, '端午节', 'json', '2026-08-07 01:33:36.447', '2026-08-07 01:33:36.447');
INSERT INTO `calendar_rule` VALUES (229, '2023-06-24', 1, '端午节', 'json', '2026-08-07 01:33:36.542', '2026-08-07 01:33:36.542');
INSERT INTO `calendar_rule` VALUES (230, '2023-06-25', 2, '端午节补班', 'json', '2026-08-07 01:33:36.636', '2026-08-07 01:33:36.636');
INSERT INTO `calendar_rule` VALUES (231, '2023-09-29', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:36.736', '2026-08-07 01:33:36.736');
INSERT INTO `calendar_rule` VALUES (232, '2023-09-30', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:36.836', '2026-08-07 01:33:36.836');
INSERT INTO `calendar_rule` VALUES (233, '2023-10-01', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:36.931', '2026-08-07 01:33:36.931');
INSERT INTO `calendar_rule` VALUES (234, '2023-10-02', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:37.028', '2026-08-07 01:33:37.028');
INSERT INTO `calendar_rule` VALUES (235, '2023-10-03', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:37.130', '2026-08-07 01:33:37.130');
INSERT INTO `calendar_rule` VALUES (236, '2023-10-04', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:37.225', '2026-08-07 01:33:37.225');
INSERT INTO `calendar_rule` VALUES (237, '2023-10-05', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:37.319', '2026-08-07 01:33:37.319');
INSERT INTO `calendar_rule` VALUES (238, '2023-10-06', 1, '中秋节和国庆节', 'json', '2026-08-07 01:33:37.413', '2026-08-07 01:33:37.413');
INSERT INTO `calendar_rule` VALUES (239, '2023-10-07', 2, '中秋节和国庆节补班', 'json', '2026-08-07 01:33:37.516', '2026-08-07 01:33:37.516');
INSERT INTO `calendar_rule` VALUES (240, '2023-10-08', 2, '中秋节和国庆节补班', 'json', '2026-08-07 01:33:37.610', '2026-08-07 01:33:37.610');
INSERT INTO `calendar_rule` VALUES (241, '2024-01-01', 1, '元旦', 'json', '2026-08-07 01:33:44.132', '2026-08-07 01:33:44.132');
INSERT INTO `calendar_rule` VALUES (242, '2024-02-04', 2, '春节补班', 'json', '2026-08-07 01:33:44.625', '2026-08-07 01:33:44.625');
INSERT INTO `calendar_rule` VALUES (243, '2024-02-10', 1, '春节', 'json', '2026-08-07 01:33:44.829', '2026-08-07 01:33:44.829');
INSERT INTO `calendar_rule` VALUES (244, '2024-02-11', 1, '春节', 'json', '2026-08-07 01:33:45.227', '2026-08-07 01:33:45.227');
INSERT INTO `calendar_rule` VALUES (245, '2024-02-12', 1, '春节', 'json', '2026-08-07 01:33:45.320', '2026-08-07 01:33:45.320');
INSERT INTO `calendar_rule` VALUES (246, '2024-02-13', 1, '春节', 'json', '2026-08-07 01:33:45.418', '2026-08-07 01:33:45.418');
INSERT INTO `calendar_rule` VALUES (247, '2024-02-14', 1, '春节', 'json', '2026-08-07 01:33:45.512', '2026-08-07 01:33:45.512');
INSERT INTO `calendar_rule` VALUES (248, '2024-02-15', 1, '春节', 'json', '2026-08-07 01:33:45.606', '2026-08-07 01:33:45.606');
INSERT INTO `calendar_rule` VALUES (249, '2024-02-16', 1, '春节', 'json', '2026-08-07 01:33:45.706', '2026-08-07 01:33:45.706');
INSERT INTO `calendar_rule` VALUES (250, '2024-02-17', 1, '春节', 'json', '2026-08-07 01:33:45.803', '2026-08-07 01:33:45.803');
INSERT INTO `calendar_rule` VALUES (251, '2024-02-18', 2, '春节补班', 'json', '2026-08-07 01:33:45.899', '2026-08-07 01:33:45.899');
INSERT INTO `calendar_rule` VALUES (252, '2024-04-04', 1, '清明节', 'json', '2026-08-07 01:33:46.000', '2026-08-07 01:33:46.000');
INSERT INTO `calendar_rule` VALUES (253, '2024-04-05', 1, '清明节', 'json', '2026-08-07 01:33:46.095', '2026-08-07 01:33:46.095');
INSERT INTO `calendar_rule` VALUES (254, '2024-04-06', 1, '清明节', 'json', '2026-08-07 01:33:46.189', '2026-08-07 01:33:46.189');
INSERT INTO `calendar_rule` VALUES (255, '2024-04-07', 2, '清明节补班', 'json', '2026-08-07 01:33:46.284', '2026-08-07 01:33:46.284');
INSERT INTO `calendar_rule` VALUES (256, '2024-04-28', 2, '劳动节补班', 'json', '2026-08-07 01:33:46.377', '2026-08-07 01:33:46.377');
INSERT INTO `calendar_rule` VALUES (257, '2024-05-01', 1, '劳动节', 'json', '2026-08-07 01:33:46.474', '2026-08-07 01:33:46.474');
INSERT INTO `calendar_rule` VALUES (258, '2024-05-02', 1, '劳动节', 'json', '2026-08-07 01:33:46.569', '2026-08-07 01:33:46.569');
INSERT INTO `calendar_rule` VALUES (259, '2024-05-03', 1, '劳动节', 'json', '2026-08-07 01:33:46.668', '2026-08-07 01:33:46.668');
INSERT INTO `calendar_rule` VALUES (260, '2024-05-04', 1, '劳动节', 'json', '2026-08-07 01:33:46.763', '2026-08-07 01:33:46.763');
INSERT INTO `calendar_rule` VALUES (261, '2024-05-05', 1, '劳动节', 'json', '2026-08-07 01:33:46.858', '2026-08-07 01:33:46.858');
INSERT INTO `calendar_rule` VALUES (262, '2024-05-11', 2, '劳动节补班', 'json', '2026-08-07 01:33:46.954', '2026-08-07 01:33:46.954');
INSERT INTO `calendar_rule` VALUES (263, '2024-06-10', 1, '端午节', 'json', '2026-08-07 01:33:47.049', '2026-08-07 01:33:47.049');
INSERT INTO `calendar_rule` VALUES (264, '2024-09-14', 2, '中秋节补班', 'json', '2026-08-07 01:33:47.145', '2026-08-07 01:33:47.145');
INSERT INTO `calendar_rule` VALUES (265, '2024-09-15', 1, '中秋节', 'json', '2026-08-07 01:33:47.240', '2026-08-07 01:33:47.240');
INSERT INTO `calendar_rule` VALUES (266, '2024-09-16', 1, '中秋节', 'json', '2026-08-07 01:33:47.337', '2026-08-07 01:33:47.337');
INSERT INTO `calendar_rule` VALUES (267, '2024-09-17', 1, '中秋节', 'json', '2026-08-07 01:33:47.433', '2026-08-07 01:33:47.433');
INSERT INTO `calendar_rule` VALUES (268, '2024-09-29', 2, '国庆节补班', 'json', '2026-08-07 01:33:47.530', '2026-08-07 01:33:47.530');
INSERT INTO `calendar_rule` VALUES (269, '2024-10-01', 1, '国庆节', 'json', '2026-08-07 01:33:47.626', '2026-08-07 01:33:47.626');
INSERT INTO `calendar_rule` VALUES (270, '2024-10-02', 1, '国庆节', 'json', '2026-08-07 01:33:47.728', '2026-08-07 01:33:47.728');
INSERT INTO `calendar_rule` VALUES (271, '2024-10-03', 1, '国庆节', 'json', '2026-08-07 01:33:47.823', '2026-08-07 01:33:47.823');
INSERT INTO `calendar_rule` VALUES (272, '2024-10-04', 1, '国庆节', 'json', '2026-08-07 01:33:47.920', '2026-08-07 01:33:47.920');
INSERT INTO `calendar_rule` VALUES (273, '2024-10-05', 1, '国庆节', 'json', '2026-08-07 01:33:48.015', '2026-08-07 01:33:48.015');
INSERT INTO `calendar_rule` VALUES (274, '2024-10-06', 1, '国庆节', 'json', '2026-08-07 01:33:48.115', '2026-08-07 01:33:48.115');
INSERT INTO `calendar_rule` VALUES (275, '2024-10-07', 1, '国庆节', 'json', '2026-08-07 01:33:48.207', '2026-08-07 01:33:48.207');
INSERT INTO `calendar_rule` VALUES (276, '2024-10-12', 2, '国庆节补班', 'json', '2026-08-07 01:33:48.305', '2026-08-07 01:33:48.305');
INSERT INTO `calendar_rule` VALUES (277, '2025-01-01', 1, '元旦', 'json', '2026-08-07 01:33:54.046', '2026-08-07 01:33:54.046');
INSERT INTO `calendar_rule` VALUES (278, '2025-01-26', 2, '春节补班', 'json', '2026-08-07 01:33:54.455', '2026-08-07 01:33:54.455');
INSERT INTO `calendar_rule` VALUES (279, '2025-01-28', 1, '春节', 'json', '2026-08-07 01:33:54.660', '2026-08-07 01:33:54.660');
INSERT INTO `calendar_rule` VALUES (280, '2025-01-29', 1, '春节', 'json', '2026-08-07 01:33:54.761', '2026-08-07 01:33:54.761');
INSERT INTO `calendar_rule` VALUES (281, '2025-01-30', 1, '春节', 'json', '2026-08-07 01:33:54.924', '2026-08-07 01:33:54.924');
INSERT INTO `calendar_rule` VALUES (282, '2025-01-31', 1, '春节', 'json', '2026-08-07 01:33:55.144', '2026-08-07 01:33:55.144');
INSERT INTO `calendar_rule` VALUES (283, '2025-02-01', 1, '春节', 'json', '2026-08-07 01:33:55.402', '2026-08-07 01:33:55.402');
INSERT INTO `calendar_rule` VALUES (284, '2025-02-02', 1, '春节', 'json', '2026-08-07 01:33:55.501', '2026-08-07 01:33:55.501');
INSERT INTO `calendar_rule` VALUES (285, '2025-02-03', 1, '春节', 'json', '2026-08-07 01:33:55.596', '2026-08-07 01:33:55.596');
INSERT INTO `calendar_rule` VALUES (286, '2025-02-04', 1, '春节', 'json', '2026-08-07 01:33:55.700', '2026-08-07 01:33:55.700');
INSERT INTO `calendar_rule` VALUES (287, '2025-02-08', 2, '春节补班', 'json', '2026-08-07 01:33:55.795', '2026-08-07 01:33:55.795');
INSERT INTO `calendar_rule` VALUES (288, '2025-04-04', 1, '清明节', 'json', '2026-08-07 01:33:55.893', '2026-08-07 01:33:55.893');
INSERT INTO `calendar_rule` VALUES (289, '2025-04-05', 1, '清明节', 'json', '2026-08-07 01:33:55.986', '2026-08-07 01:33:55.986');
INSERT INTO `calendar_rule` VALUES (290, '2025-04-06', 1, '清明节', 'json', '2026-08-07 01:33:56.086', '2026-08-07 01:33:56.086');
INSERT INTO `calendar_rule` VALUES (291, '2025-04-27', 2, '劳动节补班', 'json', '2026-08-07 01:33:56.182', '2026-08-07 01:33:56.182');
INSERT INTO `calendar_rule` VALUES (292, '2025-05-01', 1, '劳动节', 'json', '2026-08-07 01:33:56.282', '2026-08-07 01:33:56.282');
INSERT INTO `calendar_rule` VALUES (293, '2025-05-02', 1, '劳动节', 'json', '2026-08-07 01:33:56.381', '2026-08-07 01:33:56.381');
INSERT INTO `calendar_rule` VALUES (294, '2025-05-03', 1, '劳动节', 'json', '2026-08-07 01:33:56.477', '2026-08-07 01:33:56.477');
INSERT INTO `calendar_rule` VALUES (295, '2025-05-04', 1, '劳动节', 'json', '2026-08-07 01:33:56.572', '2026-08-07 01:33:56.572');
INSERT INTO `calendar_rule` VALUES (296, '2025-05-05', 1, '劳动节', 'json', '2026-08-07 01:33:56.665', '2026-08-07 01:33:56.665');
INSERT INTO `calendar_rule` VALUES (297, '2025-05-31', 1, '端午节', 'json', '2026-08-07 01:33:56.805', '2026-08-07 01:33:56.805');
INSERT INTO `calendar_rule` VALUES (298, '2025-06-01', 1, '端午节', 'json', '2026-08-07 01:33:56.903', '2026-08-07 01:33:56.903');
INSERT INTO `calendar_rule` VALUES (299, '2025-06-02', 1, '端午节', 'json', '2026-08-07 01:33:57.001', '2026-08-07 01:33:57.001');
INSERT INTO `calendar_rule` VALUES (300, '2025-09-28', 2, '国庆节补班', 'json', '2026-08-07 01:33:57.097', '2026-08-07 01:33:57.097');
INSERT INTO `calendar_rule` VALUES (301, '2025-10-01', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.190', '2026-08-07 01:33:57.190');
INSERT INTO `calendar_rule` VALUES (302, '2025-10-02', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.295', '2026-08-07 01:33:57.295');
INSERT INTO `calendar_rule` VALUES (303, '2025-10-03', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.392', '2026-08-07 01:33:57.392');
INSERT INTO `calendar_rule` VALUES (304, '2025-10-04', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.486', '2026-08-07 01:33:57.486');
INSERT INTO `calendar_rule` VALUES (305, '2025-10-05', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.586', '2026-08-07 01:33:57.586');
INSERT INTO `calendar_rule` VALUES (306, '2025-10-06', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.692', '2026-08-07 01:33:57.692');
INSERT INTO `calendar_rule` VALUES (307, '2025-10-07', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.789', '2026-08-07 01:33:57.789');
INSERT INTO `calendar_rule` VALUES (308, '2025-10-08', 1, '国庆节、中秋节', 'json', '2026-08-07 01:33:57.884', '2026-08-07 01:33:57.884');
INSERT INTO `calendar_rule` VALUES (309, '2025-10-11', 2, '国庆节补班', 'json', '2026-08-07 01:33:57.985', '2026-08-07 01:33:57.985');
INSERT INTO `calendar_rule` VALUES (310, '2026-01-01', 1, '元旦', 'json', '2026-08-07 01:34:02.330', '2026-08-07 01:34:45.345');
INSERT INTO `calendar_rule` VALUES (311, '2026-01-02', 1, '元旦', 'json', '2026-08-07 01:34:02.445', '2026-08-07 01:34:46.269');
INSERT INTO `calendar_rule` VALUES (312, '2026-01-03', 1, '元旦', 'json', '2026-08-07 01:34:02.544', '2026-08-07 01:34:46.747');
INSERT INTO `calendar_rule` VALUES (313, '2026-01-04', 2, '元旦补班', 'json', '2026-08-07 01:34:02.789', '2026-08-07 01:34:46.987');
INSERT INTO `calendar_rule` VALUES (314, '2026-02-14', 2, '春节补班', 'json', '2026-08-07 01:34:02.891', '2026-08-07 01:34:47.235');
INSERT INTO `calendar_rule` VALUES (315, '2026-02-15', 1, '春节', 'json', '2026-08-07 01:34:02.991', '2026-08-07 01:34:47.658');
INSERT INTO `calendar_rule` VALUES (316, '2026-02-16', 1, '春节', 'json', '2026-08-07 01:34:03.090', '2026-08-07 01:34:47.848');
INSERT INTO `calendar_rule` VALUES (317, '2026-02-17', 1, '春节', 'json', '2026-08-07 01:34:03.194', '2026-08-07 01:34:47.953');
INSERT INTO `calendar_rule` VALUES (318, '2026-02-18', 1, '春节', 'json', '2026-08-07 01:34:03.292', '2026-08-07 01:34:48.061');
INSERT INTO `calendar_rule` VALUES (319, '2026-02-19', 1, '春节', 'json', '2026-08-07 01:34:03.390', '2026-08-07 01:34:48.163');
INSERT INTO `calendar_rule` VALUES (320, '2026-02-20', 1, '春节', 'json', '2026-08-07 01:34:03.494', '2026-08-07 01:34:48.265');
INSERT INTO `calendar_rule` VALUES (321, '2026-02-21', 1, '春节', 'json', '2026-08-07 01:34:03.594', '2026-08-07 01:34:48.426');
INSERT INTO `calendar_rule` VALUES (322, '2026-02-22', 1, '春节', 'json', '2026-08-07 01:34:03.700', '2026-08-07 01:34:48.528');
INSERT INTO `calendar_rule` VALUES (323, '2026-02-23', 1, '春节', 'json', '2026-08-07 01:34:03.803', '2026-08-07 01:34:48.632');
INSERT INTO `calendar_rule` VALUES (324, '2026-02-28', 2, '春节补班', 'json', '2026-08-07 01:34:03.945', '2026-08-07 01:34:48.742');
INSERT INTO `calendar_rule` VALUES (325, '2026-04-04', 1, '清明节', 'json', '2026-08-07 01:34:04.043', '2026-08-07 01:34:48.847');
INSERT INTO `calendar_rule` VALUES (326, '2026-04-05', 1, '清明节', 'json', '2026-08-07 01:34:04.140', '2026-08-07 01:34:48.953');
INSERT INTO `calendar_rule` VALUES (327, '2026-04-06', 1, '清明节', 'json', '2026-08-07 01:34:04.241', '2026-08-07 01:34:49.062');
INSERT INTO `calendar_rule` VALUES (328, '2026-05-01', 1, '劳动节', 'json', '2026-08-07 01:34:04.339', '2026-08-07 01:34:49.170');
INSERT INTO `calendar_rule` VALUES (329, '2026-05-02', 1, '劳动节', 'json', '2026-08-07 01:34:04.440', '2026-08-07 01:34:49.288');
INSERT INTO `calendar_rule` VALUES (330, '2026-05-03', 1, '劳动节', 'json', '2026-08-07 01:34:04.536', '2026-08-07 01:34:49.393');
INSERT INTO `calendar_rule` VALUES (331, '2026-05-04', 1, '劳动节', 'json', '2026-08-07 01:34:04.695', '2026-08-07 01:34:49.497');
INSERT INTO `calendar_rule` VALUES (332, '2026-05-05', 1, '劳动节', 'json', '2026-08-07 01:34:04.794', '2026-08-07 01:34:49.604');
INSERT INTO `calendar_rule` VALUES (333, '2026-05-09', 2, '劳动节补班', 'json', '2026-08-07 01:34:04.891', '2026-08-07 01:34:49.715');
INSERT INTO `calendar_rule` VALUES (334, '2026-06-19', 1, '端午节', 'json', '2026-08-07 01:34:04.995', '2026-08-07 01:34:49.827');
INSERT INTO `calendar_rule` VALUES (335, '2026-06-20', 1, '端午节', 'json', '2026-08-07 01:34:05.095', '2026-08-07 01:34:49.938');
INSERT INTO `calendar_rule` VALUES (336, '2026-06-21', 1, '端午节', 'json', '2026-08-07 01:34:05.194', '2026-08-07 01:34:50.041');
INSERT INTO `calendar_rule` VALUES (337, '2026-09-25', 1, '中秋节', 'json', '2026-08-07 01:34:05.291', '2026-08-07 01:34:50.145');
INSERT INTO `calendar_rule` VALUES (338, '2026-09-26', 1, '中秋节', 'json', '2026-08-07 01:34:05.388', '2026-08-07 01:34:50.252');
INSERT INTO `calendar_rule` VALUES (339, '2026-09-27', 1, '中秋节', 'json', '2026-08-07 01:34:05.489', '2026-08-07 01:34:50.374');
INSERT INTO `calendar_rule` VALUES (340, '2026-09-20', 2, '国庆节补班', 'json', '2026-08-07 01:34:05.587', '2026-08-07 01:34:50.479');
INSERT INTO `calendar_rule` VALUES (341, '2026-10-01', 1, '国庆节', 'json', '2026-08-07 01:34:05.708', '2026-08-07 01:34:50.582');
INSERT INTO `calendar_rule` VALUES (342, '2026-10-02', 1, '国庆节', 'json', '2026-08-07 01:34:05.807', '2026-08-07 01:34:50.694');
INSERT INTO `calendar_rule` VALUES (343, '2026-10-03', 1, '国庆节', 'json', '2026-08-07 01:34:05.908', '2026-08-07 01:34:50.796');
INSERT INTO `calendar_rule` VALUES (344, '2026-10-04', 1, '国庆节', 'json', '2026-08-07 01:34:06.010', '2026-08-07 01:34:50.901');
INSERT INTO `calendar_rule` VALUES (345, '2026-10-05', 1, '国庆节', 'json', '2026-08-07 01:34:06.107', '2026-08-07 01:34:51.009');
INSERT INTO `calendar_rule` VALUES (346, '2026-10-06', 1, '国庆节', 'json', '2026-08-07 01:34:06.206', '2026-08-07 01:34:51.112');
INSERT INTO `calendar_rule` VALUES (347, '2026-10-07', 1, '国庆节', 'json', '2026-08-07 01:34:06.306', '2026-08-07 01:34:51.214');
INSERT INTO `calendar_rule` VALUES (348, '2026-10-10', 2, '国庆节补班', 'json', '2026-08-07 01:34:06.406', '2026-08-07 01:34:51.320');

-- ----------------------------
-- Table structure for feishu_user_cache
-- ----------------------------
DROP TABLE IF EXISTS `feishu_user_cache`;
CREATE TABLE `feishu_user_cache`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `union_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobile` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `department_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `enabled` int(11) NOT NULL DEFAULT 1,
  `last_sync_at` datetime(3) NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `holiday_report_enabled` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `feishu_user_cache_open_id_key`(`open_id`) USING BTREE,
  INDEX `feishu_user_cache_name_idx`(`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of feishu_user_cache
-- ----------------------------
INSERT INTO `feishu_user_cache` VALUES (1, 'ou_f82a897a24d387dc1346fbe2bb1b4a83', 'on_3aab6b69b42b6a6f43dd80825d01c552', '8651adf5', '李志祥', NULL, '', NULL, 1, '2026-08-05 09:35:22.501', '2026-08-04 01:29:06.618', '2026-08-07 00:49:13.851', 1);
INSERT INTO `feishu_user_cache` VALUES (2, 'ou_29fa6e21867e0a15c780722094e33001', 'on_ceae6904f53a5fc40f3bcb401b1aca28', '399b3d2c', '林超', NULL, 'levi@beasun.com', NULL, 1, '2026-08-04 09:24:40.382', '2026-08-04 01:35:01.940', '2026-08-04 09:24:40.383', 1);
INSERT INTO `feishu_user_cache` VALUES (3, 'ou_d1509dd89400ed93eadc2f8a7fcc7162', 'on_2471af4b1ebe179a71bb56a497f95536', '8693bfb5', '李振福', NULL, '', NULL, 1, '2026-08-07 02:11:37.560', '2026-08-04 01:35:33.723', '2026-08-07 02:11:37.561', 1);
INSERT INTO `feishu_user_cache` VALUES (4, 'ou_336a9120928ac9fa8eb76712a31706a3', 'on_f780ff9e6dfba1727f5d4d5f48d49fcb', NULL, '黄明坤', NULL, 'leo@beasun.com', NULL, 1, '2026-08-07 05:41:21.500', '2026-08-07 05:22:38.734', '2026-08-07 05:41:21.501', 1);
INSERT INTO `feishu_user_cache` VALUES (5, 'ou_74b5225f06df7cfcb6a5601fd3829bd2', 'on_29041613f03f13a25f9f42504d608245', NULL, '王玮', NULL, NULL, NULL, 1, '2026-08-07 05:41:21.512', '2026-08-07 05:22:38.914', '2026-08-07 05:41:21.513', 1);
INSERT INTO `feishu_user_cache` VALUES (6, 'ou_b179670f034419593d5f01987bd7a154', 'on_a6299bcebc60638f5764b5f8eb505124', NULL, '夏红兵', NULL, 'avans@beasun.com', NULL, 1, '2026-08-07 05:41:21.525', '2026-08-07 05:22:39.024', '2026-08-07 05:41:21.526', 1);
INSERT INTO `feishu_user_cache` VALUES (7, 'ou_a44323030b4f7a67f3d9e05db492d4d2', 'on_39ec46ea0a1fc9d06cb507a14a80ea9f', NULL, '王新胜', NULL, 'xinsheng.wang@beasun.com', NULL, 1, '2026-08-07 05:41:21.535', '2026-08-07 05:22:39.137', '2026-08-07 05:41:21.536', 1);
INSERT INTO `feishu_user_cache` VALUES (8, 'ou_90557334eefa9395702134ea56d14c85', 'on_efc6a87b10a41dbbaa0e924fb428cfba', NULL, '赵志', NULL, NULL, NULL, 1, '2026-08-07 05:41:21.856', '2026-08-07 05:23:00.400', '2026-08-07 05:41:21.857', 1);
INSERT INTO `feishu_user_cache` VALUES (9, 'ou_a11a4bddbb5a8d7f224f593ba660fea5', 'on_a63ede7dcaa89cb916a5f2e5545d17a7', NULL, '杜月明', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.188', '2026-08-07 05:23:00.821', '2026-08-07 05:41:22.189', 1);
INSERT INTO `feishu_user_cache` VALUES (10, 'ou_19f36fe59b667645eda1b80f1d4b7c79', 'on_8d8eedd98469a4847df5300ea2372f2d', NULL, '李季', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.195', '2026-08-07 05:23:00.930', '2026-08-07 05:41:22.196', 1);
INSERT INTO `feishu_user_cache` VALUES (11, 'ou_8aa02e44e97c49ce04f071549837bd2e', 'on_a416dc23de50ecd17678b48fe3961833', NULL, '金瑞利', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.551', '2026-08-07 05:23:01.501', '2026-08-07 05:41:22.552', 1);
INSERT INTO `feishu_user_cache` VALUES (12, 'ou_7618b32495a308d70017185250e96c51', 'on_ffaf36b7683d2dcaf7234852096caa3d', NULL, '孟令静', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.560', '2026-08-07 05:23:01.937', '2026-08-07 05:41:22.561', 1);
INSERT INTO `feishu_user_cache` VALUES (13, 'ou_d9c18f322c08ee54ac23317774feb26a', 'on_0481d6c663a2aa034121633cf5894779', NULL, '滕伟洁', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.567', '2026-08-07 05:23:02.449', '2026-08-07 05:41:22.568', 1);
INSERT INTO `feishu_user_cache` VALUES (14, 'ou_e8b14316938db52e8fcee74382296c31', 'on_81605f99d32eeb4110b24fadfdbb6883', NULL, '胡正杰', NULL, 'wh@beasun.com', NULL, 1, '2026-08-07 05:41:22.576', '2026-08-07 05:23:02.737', '2026-08-07 05:41:22.577', 1);
INSERT INTO `feishu_user_cache` VALUES (15, 'ou_ea9d58565aef4be07a931cfe49160d72', 'on_c372ac9843c84068f8e0d79968b58cdb', NULL, '辛宝宝', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.583', '2026-08-07 05:23:03.138', '2026-08-07 05:41:22.584', 1);
INSERT INTO `feishu_user_cache` VALUES (16, 'ou_da4f49121c0801d11da33ac73fa817be', 'on_0d614df6ad769b8ad6f22999a8fe63e3', NULL, '史亮', NULL, NULL, NULL, 1, '2026-08-07 05:41:22.912', '2026-08-07 05:23:03.754', '2026-08-07 05:41:22.913', 1);
INSERT INTO `feishu_user_cache` VALUES (17, 'ou_a93e5c024dfb533018a3f1eb3db8fbc3', 'on_4311d074db9c0559b5cc9c3a5385ef85', NULL, '王成兰', NULL, 'ella.wang@beasun.com', NULL, 1, '2026-08-07 05:41:23.222', '2026-08-07 05:23:04.572', '2026-08-07 05:41:23.223', 1);
INSERT INTO `feishu_user_cache` VALUES (18, 'ou_b6ac97eba3f262f92ae6b4ffb5522e59', 'on_f0eeedc542e28eb637d621e0a25c57f1', NULL, '彭英文', NULL, 'iqc@beasun.com', NULL, 1, '2026-08-07 05:41:23.232', '2026-08-07 05:23:04.759', '2026-08-07 05:41:23.233', 1);
INSERT INTO `feishu_user_cache` VALUES (19, 'ou_8272b408ec838c7ca0209c2bbbf7fbe4', 'on_7d19ed89756748edeff50aa9e47acd5d', NULL, '黄辉', NULL, 'huanghui@beasun.com', NULL, 1, '2026-08-07 05:41:23.574', '2026-08-07 05:23:05.596', '2026-08-07 05:41:23.575', 1);
INSERT INTO `feishu_user_cache` VALUES (20, 'ou_50aed1478257e528c63def96bb0439b7', 'on_0fe36d0659e1b593cac37b8dfb39b3bb', NULL, '王海涛', NULL, 'haitao.wang@beasun.com', NULL, 1, '2026-08-07 05:41:23.582', '2026-08-07 05:23:06.312', '2026-08-07 05:41:23.583', 1);
INSERT INTO `feishu_user_cache` VALUES (21, 'ou_2815d4c31224defe6d097adb811e9ea5', 'on_1f4aa31568c537d24c3165646b897775', NULL, '曹岱', NULL, NULL, NULL, 1, '2026-08-07 05:41:23.590', '2026-08-07 05:23:06.633', '2026-08-07 05:41:23.590', 1);
INSERT INTO `feishu_user_cache` VALUES (22, 'ou_baeb30c13056d87e775f932333d3fc97', 'on_70daf2c42e7360b23569deb3cb712350', NULL, '李娜', NULL, 'angel.li@beasun.com', NULL, 1, '2026-08-07 05:41:23.888', '2026-08-07 05:23:07.338', '2026-08-07 05:41:23.888', 1);

-- ----------------------------
-- Table structure for message_log
-- ----------------------------
DROP TABLE IF EXISTS `message_log`;
CREATE TABLE `message_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receiver_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `msg_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `work_report_id` int(11) NULL DEFAULT NULL,
  `sendStatus` int(11) NOT NULL DEFAULT 0,
  `error` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `message_log_work_report_id_idx`(`work_report_id`) USING BTREE,
  INDEX `message_log_receiver_open_id_idx`(`receiver_open_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message_log
-- ----------------------------

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `created_by_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted` int(11) NOT NULL DEFAULT 0,
  `contract_amount` decimal(14, 2) NULL DEFAULT NULL,
  `contract_date` date NULL DEFAULT NULL,
  `contract_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `patent_applied` int(11) NOT NULL DEFAULT 0,
  `priority` int(11) NOT NULL DEFAULT 3,
  `rd_cost_amortization` decimal(14, 2) NULL DEFAULT NULL,
  `rd_project_doc` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `project_status_deleted_idx`(`status`, `deleted`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project
-- ----------------------------
INSERT INTO `project` VALUES (1, '双灯智能版数字电子镇流器', NULL, '2*30～80W，采用7#和8#外壳', 1, '2023-01-11', '2025-01-30', 'ou_f82a897a24d387dc1346fbe2bb1b4a83', '2026-08-04 08:57:21.391', '2026-08-07 05:06:17.496', 0, 811200.00, '2023-01-10', '2023-RD001_0512168', 0, 2, NULL, '双灯智能版数字电子镇流器', NULL);
INSERT INTO `project` VALUES (2, '智能版数字电子镇流器', NULL, 'AC和DC输入，1*4～25W，采用2#和3#外壳', 1, '2023-02-15', '2025-01-30', 'ou_f82a897a24d387dc1346fbe2bb1b4a83', '2026-08-07 09:40:56.682', '2026-08-07 09:40:56.682', 0, 717600.00, '2023-02-15', '2023-RD002_0512168', 0, 2, NULL, '智能版数字电子镇流器', NULL);
INSERT INTO `project` VALUES (3, 'UV201-0.5G-RO', NULL, '螺旋管杀菌器', 1, '2023-03-25', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 966000.00, '2023-03-25', '2023-RD003_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (4, '独立显示智能版数字电子镇流器', NULL, '1*40～160W，采用9#外壳', 1, '2023-05-22', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 1037400.00, '2023-05-22', '2023-RD004_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (5, 'LS304F，iNFC401', NULL, 'PPS材料智能灯座', 1, '2023-06-20', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 526200.00, '2023-06-20', '2023-RD005_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (6, '单灯120W数字智能镇流器', NULL, '采用6#外壳', 1, '2023-10-20', '2025-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 823800.00, '2023-10-20', '2023-RD006_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (7, '轨道式智能版数字电子镇流器', NULL, '2*130～500W', 1, '2024-02-01', '2025-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 4875000.00, '2024-02-01', '2024-RD007_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (8, '经济版数字电子镇流器', NULL, '1*4～160W', 1, '2024-06-28', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 990000.00, '2024-06-28', '2024-RD008_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (9, '管理软件', NULL, 'ERP、PLM、WMS、MES', 1, '2024-07-30', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 02:49:46.264', 0, 900000.00, '2024-07-30', '2024-RD009_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (10, '4KW PFC项目', NULL, '外包项目', 1, '2024-08-09', '2025-06-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 100000.00, '2024-08-09', '2024-RD010_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (11, '180～320W经济版数字电子镇流器', NULL, '经济版，独立和端子结构，采用9#外壳', 1, '2025-02-20', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, 1896000.00, '2025-02-20', '2025-RD011_0512168', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (12, '紫外防尘罩', NULL, '防尘罩和4～40W防尘罩镇流器', 1, '2025-02-20', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-02-20', '2025-RD012_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (13, '传感器', NULL, '水流、紫外、水温、空气温湿度', 1, '2025-05-10', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-05-10', '2025-RD013_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (14, 'AC～AC项目', NULL, '新拓扑AC to AC 数字智能镇流器', 1, '2025-06-05', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-06-05', '2025-RD014_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (15, '86液晶显示屏', NULL, NULL, 1, '2025-06-10', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-06-10', '2025-RD015_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (16, 'ATE自动测试设备', NULL, NULL, 1, '2025-07-20', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-07-20', '2025-RD016_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (17, '激光打标机', NULL, NULL, 1, '2025-08-20', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-08-20', '2025-RD017_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (18, '自动化组装流水线项目', NULL, NULL, 1, '2025-08-20', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-08-20', '2025-RD018_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (19, 'PCBA料车', NULL, NULL, 1, '2025-08-20', '2026-06-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-08-20', '2025-RD019_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (20, '异形插件机项目', NULL, NULL, 1, '2025-08-20', '2026-01-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-08-20', '2025-RD020_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (21, '12加仑多支石英管杀菌器', NULL, NULL, 1, '2025-08-20', '2026-05-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-08-20', '2025-RD021_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (22, 'LED紫外杀菌器', NULL, NULL, 1, '2025-10-10', '2026-05-30', NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2025-10-10', '2025-RD022_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (23, 'DC经济版数字电子镇流器', NULL, NULL, 1, '2026-03-12', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2026-03-12', '2026-RD023_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (24, 'RM51系列经济版数字电子镇流器', NULL, NULL, 1, '2026-04-28', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2026-04-28', '2026-RD024_2002128', 0, 3, NULL, NULL, NULL);
INSERT INTO `project` VALUES (25, '双灯经济版数字电子镇流器', NULL, NULL, 1, '2026-04-28', NULL, NULL, '2026-08-07 09:47:59.128', '2026-08-07 09:47:59.128', 0, NULL, '2026-04-28', '2026-RD025_2002128', 0, 3, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for project_member
-- ----------------------------
DROP TABLE IF EXISTS `project_member`;
CREATE TABLE `project_member`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` int(11) NOT NULL DEFAULT 2,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `project_member_project_id_open_id_key`(`project_id`, `open_id`) USING BTREE,
  INDEX `project_member_open_id_idx`(`open_id`) USING BTREE,
  CONSTRAINT `project_member_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project_member
-- ----------------------------
INSERT INTO `project_member` VALUES (10, 9, 'ou_29fa6e21867e0a15c780722094e33001', '林超', 1, '2026-08-07 02:49:46.264');

-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `system_config_config_key_key`(`config_key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_config
-- ----------------------------
INSERT INTO `system_config` VALUES (1, 'holiday_report_enabled', '1', NULL, '2026-08-07 00:25:07.648');
INSERT INTO `system_config` VALUES (2, 'working_hours_limit', '8', NULL, '2026-08-07 00:25:07.333');
INSERT INTO `system_config` VALUES (3, 'calendar_json_url', 'https://unpkg.com/holiday-calendar/data/CN/{year}.json', NULL, '2026-08-07 01:34:43.149');

-- ----------------------------
-- Table structure for work_report
-- ----------------------------
DROP TABLE IF EXISTS `work_report`;
CREATE TABLE `work_report`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `project_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `is_holiday` int(11) NOT NULL DEFAULT 0,
  `normal_hours` decimal(4, 1) NOT NULL,
  `overtime_hours` decimal(4, 1) NOT NULL,
  `total_hours` decimal(4, 1) NOT NULL,
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `need_approval` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1,
  `approval_instance_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `approver_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `reject_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `approved_at` datetime(3) NULL DEFAULT NULL,
  `user_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `work_report_project_id_idx`(`project_id`) USING BTREE,
  INDEX `work_report_user_open_id_report_date_idx`(`user_open_id`, `report_date`) USING BTREE,
  INDEX `work_report_status_idx`(`status`) USING BTREE,
  INDEX `work_report_report_date_idx`(`report_date`) USING BTREE,
  CONSTRAINT `work_report_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of work_report
-- ----------------------------

-- ----------------------------
-- Table structure for work_report_approval
-- ----------------------------
DROP TABLE IF EXISTS `work_report_approval`;
CREATE TABLE `work_report_approval`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `work_report_id` int(11) NOT NULL,
  `approval_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_instance_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_status` int(11) NOT NULL DEFAULT 0,
  `applicant_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `current_approver_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `form_snapshot` json NULL,
  `feishu_raw` json NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `work_report_approval_work_report_id_key`(`work_report_id`) USING BTREE,
  UNIQUE INDEX `work_report_approval_approval_instance_id_key`(`approval_instance_id`) USING BTREE,
  CONSTRAINT `work_report_approval_work_report_id_fkey` FOREIGN KEY (`work_report_id`) REFERENCES `work_report` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of work_report_approval
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
