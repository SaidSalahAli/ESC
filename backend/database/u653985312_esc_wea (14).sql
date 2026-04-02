-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2026 at 02:16 PM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u653985312_esc_wea`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `governorate` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Egypt',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `phone`, `first_name`, `last_name`, `address_line1`, `address_line2`, `city`, `state`, `governorate`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-18 22:30:45', '2025-11-18 22:30:45'),
(2, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-18 22:35:43', '2025-11-18 22:35:43'),
(3, 4, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-18 23:07:23', '2025-11-18 23:07:23'),
(4, 4, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-18 23:09:50', '2025-11-18 23:09:50'),
(5, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-18 23:32:44', '2025-11-18 23:32:44'),
(6, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'سيشسيس', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 19:04:37', '2025-11-20 19:04:37'),
(7, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'dasds', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 19:06:39', '2025-11-20 19:06:39'),
(8, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 19:47:35', '2025-11-20 19:47:35'),
(9, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'سيشسيس', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 19:48:29', '2025-11-20 19:48:29'),
(10, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'saS', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 20:40:34', '2025-11-20 20:40:34'),
(11, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'das', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-20 21:14:16', '2025-11-20 21:14:16'),
(12, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-21 00:33:03', '2025-11-21 00:33:03'),
(13, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-21 12:48:26', '2025-11-21 12:48:26'),
(14, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-21 12:49:05', '2025-11-21 12:49:05'),
(15, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-21 13:44:44', '2025-11-21 13:44:44'),
(16, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-21 14:57:04', '2025-11-21 14:57:04'),
(17, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-22 22:27:21', '2025-11-22 22:27:21'),
(18, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'سيشسيس', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-22 22:34:47', '2025-11-22 22:34:47'),
(19, 2, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-22 22:37:34', '2025-11-22 22:37:34'),
(20, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-30 22:42:44', '2025-11-30 22:42:44'),
(21, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-11-30 23:34:46', '2025-11-30 23:34:46'),
(22, 4, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2025-12-01 00:15:20', '2025-12-01 00:15:20'),
(23, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-05 12:34:28', '2026-01-05 12:34:28'),
(24, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-05 13:29:04', '2026-01-05 13:29:04'),
(25, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-05 14:15:59', '2026-01-05 14:15:59'),
(26, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 18:24:52', '2026-01-07 18:24:52'),
(27, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 18:25:50', '2026-01-07 18:25:50'),
(28, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 18:40:39', '2026-01-07 18:40:39'),
(29, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 19:42:51', '2026-01-07 19:42:51'),
(30, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 19:53:35', '2026-01-07 19:53:35'),
(31, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', '', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-01-07 20:42:15', '2026-01-07 20:42:15'),
(32, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-10 21:19:03', '2026-02-10 21:19:03'),
(33, 4, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-10 21:22:07', '2026-02-10 21:22:07'),
(34, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-14 15:39:11', '2026-02-14 15:39:11'),
(35, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-14 15:41:57', '2026-02-14 15:41:57'),
(36, 4, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-15 07:33:23', '2026-02-15 07:33:23'),
(37, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-15 07:41:04', '2026-02-15 07:41:04'),
(38, 8, NULL, NULL, NULL, 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-02-15 08:25:24', '2026-02-15 08:25:24'),
(39, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-01 23:07:05', '2026-03-01 23:07:05'),
(40, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-01 23:08:46', '2026-03-01 23:08:46'),
(41, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-02 03:38:07', '2026-03-02 03:38:07'),
(42, 4, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-02 03:40:59', '2026-03-02 03:40:59'),
(43, 4, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-02 03:42:25', '2026-03-02 03:42:25'),
(44, 4, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-02 03:44:36', '2026-03-02 03:44:36'),
(45, 4, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-02 03:47:35', '2026-03-02 03:47:35'),
(46, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-05 22:15:11', '2026-03-05 22:15:11'),
(47, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 00:17:41', '2026-03-06 00:17:41'),
(48, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 00:26:31', '2026-03-06 00:26:31'),
(49, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 00:40:27', '2026-03-06 00:40:27'),
(50, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 00:48:21', '2026-03-06 00:48:21'),
(51, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 00:58:24', '2026-03-06 00:58:24'),
(52, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:04:58', '2026-03-06 01:04:58'),
(53, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:13:53', '2026-03-06 01:13:53'),
(54, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:16:30', '2026-03-06 01:16:30'),
(55, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:16:42', '2026-03-06 01:16:42'),
(56, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:17:19', '2026-03-06 01:17:19'),
(57, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:18:42', '2026-03-06 01:18:42'),
(58, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:18:56', '2026-03-06 01:18:56'),
(59, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:44:25', '2026-03-06 01:44:25'),
(60, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 01:54:14', '2026-03-06 01:54:14'),
(61, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 03:17:41', '2026-03-06 03:17:41'),
(62, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-06 03:21:15', '2026-03-06 03:21:15'),
(63, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-10 04:59:20', '2026-03-10 04:59:20'),
(64, 4, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', NULL, '1102', 'Egypt', 0, '2026-03-11 05:07:16', '2026-03-11 05:07:16'),
(65, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', 'الجيزة', 'Giza', '1102', 'Egypt', 0, '2026-03-12 20:32:19', '2026-03-12 20:32:19'),
(66, 11, '+201066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Kafr El-Sheikh', '1102', 'Egypt', 0, '2026-03-12 21:00:27', '2026-03-12 21:00:27'),
(67, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Giza', '1102', 'Egypt', 0, '2026-03-13 03:34:06', '2026-03-13 03:34:06'),
(71, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 21:57:15', '2026-04-01 21:57:15'),
(72, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 21:57:23', '2026-04-01 21:57:23'),
(73, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 21:57:24', '2026-04-01 21:57:24'),
(74, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 21:57:29', '2026-04-01 21:57:29'),
(75, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 21:57:59', '2026-04-01 21:57:59'),
(76, NULL, '01066536008', 'Said', 'Ali', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'منشاه القناطر', '', 'Beheira', '1102', 'Egypt', 0, '2026-04-01 22:04:03', '2026-04-01 22:04:03'),
(77, 8, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-01 22:33:31', '2026-04-01 22:33:31'),
(78, 8, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Port Said', '1102', 'Egypt', 0, '2026-04-02 09:29:16', '2026-04-02 09:29:16'),
(79, 8, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Alexandria', '1102', 'Egypt', 0, '2026-04-02 09:47:06', '2026-04-02 09:47:06'),
(80, 8, '01066536008', 'Said', 'Salah', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Kafr El-Sheikh', '1102', 'Egypt', 0, '2026-04-02 11:01:23', '2026-04-02 11:01:23'),
(81, 8, '01066536008', 'Said', 'Ali', 'ابو غالب منشأه القناطر', 'ابو غالب بجانب مسجد الجبانين طريق عيسي موسي', 'المناشي', '', 'Qalyubia', '1102', 'Egypt', 0, '2026-04-02 11:06:27', '2026-04-02 11:06:27');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `size_variant_id` int(11) DEFAULT NULL,
  `color_variant_id` int(11) DEFAULT NULL,
  `variant_id` int(10) UNSIGNED DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `size_variant_id`, `color_variant_id`, `variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(10, 7, 14, NULL, NULL, NULL, 1, '2025-11-17 22:32:51', '2025-11-30 23:17:37'),
(35, 2, 5, NULL, NULL, 33, 2, '2025-11-22 23:05:46', '2025-11-22 23:06:11'),
(113, 8, 24, NULL, NULL, 347, 1, '2026-04-02 09:47:36', '2026-04-02 09:47:36');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ar` varchar(255) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `name_ar`, `slug`, `description`, `description_ar`, `image`, `parent_id`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Men', 'Men', 'men', 'Men\'s clothing and accessories', NULL, NULL, NULL, 1, 1, '2025-11-17 13:26:38', '2025-11-17 14:27:26'),
(2, 'Women', 'Women', 'women', 'Women\'s clothing and accessories', NULL, NULL, NULL, 1, 2, '2025-11-17 13:26:38', '2025-11-17 14:27:26'),
(3, 'Kids', 'Kids', 'kids', 'Kids clothing and accessories', NULL, NULL, NULL, 1, 3, '2025-11-17 13:26:38', '2025-11-17 14:27:26'),
(4, 'Accessories', 'Accessories', 'accessories', 'Fashion accessories', NULL, NULL, NULL, 1, 4, '2025-11-17 13:26:38', '2025-11-17 14:27:26'),
(5, 'test2', 'test', 'test', 'dasdas', '', NULL, NULL, 1, 0, '2025-11-17 14:20:04', '2025-11-21 13:26:30');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied','archived') DEFAULT 'new',
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `user_id`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 'Said Salah', 'saidsalah375@gmail.com', '01066536008', 'sadsd', 'aaaaaaaaaa', 'replied', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 00:23:21', '2026-01-08 00:27:56'),
(3, 'Said Salah', 'saidsalah375@gmail.com', '01066536008', 'sadsd', 'ستىكشسينتشبتسش', 'replied', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-14 15:48:05', '2026-02-14 15:49:11');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('percentage','fixed') DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT 0.00,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `executed_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `executed_at`) VALUES
(1, 'add_color_value_to_product_images', '2026-04-02 12:16:18');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `is_active`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 'saidsalah375@gmail.com', 1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-11 07:09:26', '2026-03-11 07:09:26');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `related_id` int(10) UNSIGNED DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `link`, `related_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 2, 'contact', 'New Contact Message', 'New message from Said Salah (saidsalah375@gmail.com): hello', '/dashboard/contact-messages/2', 2, 0, NULL, '2026-01-08 00:28:14'),
(3, 2, 'order', 'New Order Received', 'New order #ESC2026021072F95D has been placed by Said Salah. Total: 3698.00 EGP', '/dashboard/orders/32', 32, 0, NULL, '2026-02-10 21:19:03'),
(4, 8, 'order', 'New Order Received', 'New order #ESC2026021072F95D has been placed by Said Salah. Total: 3698.00 EGP', '/dashboard/orders/32', 32, 1, '2026-02-15 07:37:30', '2026-02-10 21:19:03'),
(5, 2, 'order', 'New Order Received', 'New order #ESC20260210FD3222 has been placed by Said Salah. Total: 3698.00 EGP', '/dashboard/orders/33', 33, 0, NULL, '2026-02-10 21:22:07'),
(6, 8, 'order', 'New Order Received', 'New order #ESC20260210FD3222 has been placed by Said Salah. Total: 3698.00 EGP', '/dashboard/orders/33', 33, 1, '2026-02-15 07:37:17', '2026-02-10 21:22:07'),
(7, 2, 'order', 'New Order Received', 'New order #ESC20260214FE3560 has been placed by Said Salah. Total: 5978.00 EGP', '/dashboard/orders/34', 34, 0, NULL, '2026-02-14 15:39:11'),
(8, 8, 'order', 'New Order Received', 'New order #ESC20260214FE3560 has been placed by Said Salah. Total: 5978.00 EGP', '/dashboard/orders/34', 34, 1, '2026-02-15 07:37:20', '2026-02-14 15:39:11'),
(9, 2, 'order', 'New Order Received', 'New order #ESC202602145A132A has been placed by Said Salah. Total: 3698.00 EGP', '/dashboard/orders/35', 35, 0, NULL, '2026-02-14 15:41:57'),
(11, 2, 'contact', 'New Contact Message', 'New message from Said Salah (saidsalah375@gmail.com): sadsd', '/dashboard/contact-messages/3', 3, 0, NULL, '2026-02-14 15:48:05'),
(13, 2, 'order', 'New Order Received', 'New order #ESC202602153A87C7 has been placed by Said Salah. Total: 28050.00 EGP', '/dashboard/orders/36', 36, 0, NULL, '2026-02-15 07:33:23'),
(15, 2, 'order', 'New Order Received', 'New order #ESC202602150F3803 has been placed by Said Salah. Total: 4050.00 EGP', '/dashboard/orders/37', 37, 0, NULL, '2026-02-15 07:41:05'),
(17, 2, 'order', 'New Order Received', 'New order #ESC202602154751F8 has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/38', 38, 0, NULL, '2026-02-15 08:25:24'),
(19, 2, 'order', 'New Order Received', 'New order #ESC20260302E0EE6A has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/39', 39, 0, NULL, '2026-03-01 23:08:46'),
(21, 2, 'order', 'New Order Received', 'New order #ESC20260302F59028 has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/40', 40, 0, NULL, '2026-03-02 03:38:07'),
(23, 2, 'order', 'New Order Received', 'New order #ESC20260302B9243D has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/41', 41, 0, NULL, '2026-03-02 03:40:59'),
(25, 2, 'order', 'New Order Received', 'New order #ESC2026030210AE8B has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/42', 42, 0, NULL, '2026-03-02 03:42:25'),
(27, 2, 'order', 'New Order Received', 'New order #ESC202603027B5FCE has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/43', 43, 0, NULL, '2026-03-02 03:47:35'),
(29, 2, 'order', 'New Order Received', 'New order #ESC20260306F51A1D has been placed by Said Salah. Total: 4050.00 EGP', '/dashboard/orders/44', 44, 0, NULL, '2026-03-05 22:15:11'),
(31, 2, 'order', 'New Order Received', 'New order #ESC2026030658CEC2 has been placed by Said Salah. Total: 4062.00 EGP', '/dashboard/orders/45', 45, 0, NULL, '2026-03-06 00:17:41'),
(33, 2, 'order', 'New Order Received', 'New order #ESC202603067934ED has been placed by Said Salah. Total: 62.00 EGP', '/dashboard/orders/46', 46, 0, NULL, '2026-03-06 00:26:31'),
(35, 2, 'order', 'New Order Received', 'New order #ESC20260306B2FFC4 has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/47', 47, 0, NULL, '2026-03-06 00:40:27'),
(37, 2, 'order', 'New Order Received', 'New order #ESC20260306521EA4 has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/48', 48, 0, NULL, '2026-03-06 00:48:21'),
(39, 2, 'order', 'New Order Received', 'New order #ESC202603060307D9 has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/49', 49, 0, NULL, '2026-03-06 00:58:24'),
(41, 2, 'order', 'New Order Received', 'New order #ESC20260306A4F1AA has been placed by Said Salah. Total: 2050.00 EGP', '/dashboard/orders/50', 50, 0, NULL, '2026-03-06 01:04:58'),
(43, 2, 'order', 'New Order Received', 'New order #ESC202603061614E6 has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/51', 51, 0, NULL, '2026-03-06 01:13:53'),
(45, 2, 'order', 'New Order Received', 'New order #ESC20260306E786AC has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/52', 52, 0, NULL, '2026-03-06 01:16:30'),
(47, 2, 'order', 'New Order Received', 'New order #ESC20260306F2576E has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/53', 53, 0, NULL, '2026-03-06 01:17:19'),
(49, 2, 'order', 'New Order Received', 'New order #ESC20260306060E34 has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/54', 54, 0, NULL, '2026-03-06 01:18:56'),
(51, 2, 'order', 'New Order Received', 'New order #ESC202603069D36AB has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/55', 55, 0, NULL, '2026-03-06 01:44:25'),
(53, 2, 'order', 'New Order Received', 'New order #ESC20260306626EF2 has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/56', 56, 0, NULL, '2026-03-06 01:54:14'),
(55, 2, 'order', 'New Order Received', 'New order #ESC202603065A441F has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/57', 57, 0, NULL, '2026-03-06 03:17:41'),
(57, 2, 'order', 'New Order Received', 'New order #ESC20260306BD708B has been placed by Said Salah. Total: 2070.00 EGP', '/dashboard/orders/58', 58, 0, NULL, '2026-03-06 03:21:15'),
(59, 2, 'order', 'New Order Received', 'New order #ESC2026031089B61F has been placed by Said Salah. Total: 312.00 EGP', '/dashboard/orders/59', 59, 0, NULL, '2026-03-10 04:59:20'),
(61, 2, 'order', 'New Order Received', 'New order #ESC202603114CE678 has been placed by Said Salah. Total: 213183.00 EGP', '/dashboard/orders/60', 60, 0, NULL, '2026-03-11 05:07:16'),
(63, 2, 'order', 'New Order Received', 'New order #ESC202603123BD315 has been placed by Said Salah. Total: 173.00 EGP', '/dashboard/orders/61', 61, 0, NULL, '2026-03-12 20:32:19'),
(65, 2, 'order', 'New Order Received', 'New order #ESC20260312B639C1 has been placed by Said Ali. Total: 183.00 EGP', '/dashboard/orders/62', 62, 0, NULL, '2026-03-12 21:00:27'),
(67, 2, 'order', 'New Order Received', 'New order #ESC20260313E71BCA has been placed by Said Salah. Total: 185.00 EGP', '/dashboard/orders/63', 63, 0, NULL, '2026-03-13 03:34:06'),
(69, 2, 'order', 'New Guest Order Received', 'New guest order #ESC2026040178A7D4 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/68', 68, 0, NULL, '2026-04-01 21:57:59'),
(70, 8, 'order', 'New Guest Order Received', 'New guest order #ESC2026040178A7D4 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/68', 68, 1, '2026-04-01 21:58:59', '2026-04-01 21:57:59'),
(71, 2, 'order', 'New Guest Order Received', 'New guest order #ESC20260402302194 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/69', 69, 0, NULL, '2026-04-01 22:04:03'),
(72, 8, 'order', 'New Guest Order Received', 'New guest order #ESC20260402302194 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/69', 69, 1, '2026-04-01 22:04:48', '2026-04-01 22:04:03'),
(73, 2, 'order', 'New Guest Order Received', 'New guest order #ESC20260402B17AA3 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/70', 70, 0, NULL, '2026-04-01 22:33:36'),
(74, 8, 'order', 'New Guest Order Received', 'New guest order #ESC20260402B17AA3 placed by Said Salah Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/70', 70, 1, '2026-04-01 22:34:47', '2026-04-01 22:33:36'),
(75, 2, 'order', 'New Guest Order Received', 'New guest order #ESC20260402C0E62C placed by Said Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/71', 71, 0, NULL, '2026-04-02 09:29:19'),
(76, 8, 'order', 'New Guest Order Received', 'New guest order #ESC20260402C0E62C placed by Said Ali (saidsalah375@gmail.com). Total: 72.00 EGP', '/dashboard/orders/71', 71, 1, '2026-04-02 09:34:26', '2026-04-02 09:29:19'),
(77, 2, 'order', 'New Order Received', 'New order #ESC20260402A6F4D8 has been placed by Said Salah. Total: 419.00 EGP', '/dashboard/orders/72', 72, 0, NULL, '2026-04-02 09:47:06'),
(78, 8, 'order', 'New Order Received', 'New order #ESC20260402A6F4D8 has been placed by Said Salah. Total: 419.00 EGP', '/dashboard/orders/72', 72, 0, NULL, '2026-04-02 09:47:06'),
(79, 2, 'order', 'New Guest Order Received', 'New guest order #ESC2026040239F5EA placed by Said Salah (saidsalah375@gmail.com). Total: 213183.00 EGP', '/dashboard/orders/73', 73, 0, NULL, '2026-04-02 11:01:28'),
(80, 8, 'order', 'New Guest Order Received', 'New guest order #ESC2026040239F5EA placed by Said Salah (saidsalah375@gmail.com). Total: 213183.00 EGP', '/dashboard/orders/73', 73, 0, NULL, '2026-04-02 11:01:28'),
(81, 2, 'order', 'New Guest Order Received', 'New guest order #ESC202604023A901C placed by Said Ali (saidsalah375@gmail.com). Total: 183.00 EGP', '/dashboard/orders/74', 74, 0, NULL, '2026-04-02 11:06:30'),
(82, 8, 'order', 'New Guest Order Received', 'New guest order #ESC202604023A901C placed by Said Ali (saidsalah375@gmail.com). Total: 183.00 EGP', '/dashboard/orders/74', 74, 0, NULL, '2026-04-02 11:06:30');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT 0,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `view_token` varchar(64) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('cib_bank','cash_on_delivery') DEFAULT 'cib_bank',
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'EGP',
  `shipping_address_id` int(10) UNSIGNED DEFAULT NULL,
  `billing_address_id` int(10) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `is_guest`, `guest_email`, `guest_phone`, `guest_name`, `view_token`, `order_number`, `barcode`, `status`, `payment_status`, `payment_method`, `subtotal`, `shipping_cost`, `discount`, `total`, `currency`, `shipping_address_id`, `billing_address_id`, `notes`, `tracking_number`, `shipped_at`, `delivered_at`, `cancelled_at`, `created_at`, `updated_at`) VALUES
(26, 8, 0, NULL, NULL, NULL, NULL, 'ESC202601074B075A', 'ESC202601074B075A', 'refunded', 'refunded', 'cib_bank', 0.00, 50.00, 0.00, 1190.00, 'EGP', 26, 26, '', NULL, NULL, NULL, NULL, '2026-01-07 18:24:52', '2026-01-07 18:27:44'),
(27, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260107EE646E', 'ESC20260107EE646E', 'refunded', 'refunded', 'cash_on_delivery', 0.00, 50.00, 0.00, 1190.00, 'EGP', 27, 27, '', NULL, NULL, NULL, NULL, '2026-01-07 18:25:50', '2026-01-07 18:31:17'),
(28, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260107732373', 'ESC20260107732373', 'refunded', 'paid', 'cib_bank', 0.00, 50.00, 0.00, 1190.00, 'EGP', 28, 28, '', NULL, NULL, NULL, NULL, '2026-01-07 18:40:39', '2026-01-07 18:46:54'),
(29, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260107BB8464', 'ESC20260107BB8464', 'processing', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 1190.00, 'EGP', 29, 29, '', NULL, NULL, NULL, NULL, '2026-01-07 19:42:51', '2026-04-01 22:05:23'),
(30, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260107F1B180', 'ESC20260107F1B180', 'pending', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 2330.00, 'EGP', 30, 30, '', NULL, NULL, NULL, NULL, '2026-01-07 19:53:35', '2026-01-07 19:53:35'),
(31, 8, 0, NULL, NULL, NULL, NULL, 'ESC202601077CF9D8', 'ESC202601077CF9D8', 'pending', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 3470.00, 'EGP', 31, 31, '', NULL, NULL, NULL, NULL, '2026-01-07 20:42:15', '2026-01-07 20:42:15'),
(32, 8, 0, NULL, NULL, NULL, NULL, 'ESC2026021072F95D', 'ESC2026021072F95D', 'delivered', 'paid', 'cash_on_delivery', 0.00, 50.00, 0.00, 3698.00, 'EGP', 32, 32, '', NULL, NULL, NULL, NULL, '2026-02-10 21:19:03', '2026-02-10 21:21:01'),
(33, 4, 0, NULL, NULL, NULL, NULL, 'ESC20260210FD3222', 'ESC20260210FD3222', 'delivered', 'paid', 'cash_on_delivery', 0.00, 50.00, 0.00, 3698.00, 'EGP', 33, 33, '', NULL, NULL, NULL, NULL, '2026-02-10 21:22:07', '2026-02-10 21:24:05'),
(34, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260214FE3560', 'ESC20260214FE3560', 'processing', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 5978.00, 'EGP', 34, 34, '', NULL, NULL, NULL, NULL, '2026-02-14 15:39:11', '2026-04-01 22:12:15'),
(35, 8, 0, NULL, NULL, NULL, NULL, 'ESC202602145A132A', 'ESC202602145A132A', 'pending', 'pending', 'cib_bank', 0.00, 50.00, 0.00, 3698.00, 'EGP', 35, 35, '', NULL, NULL, NULL, NULL, '2026-02-14 15:41:57', '2026-02-14 15:41:57'),
(36, 4, 0, NULL, NULL, NULL, NULL, 'ESC202602153A87C7', 'ESC202602153A87C7', 'pending', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 28050.00, 'EGP', 36, 36, '', NULL, NULL, NULL, NULL, '2026-02-15 07:33:23', '2026-02-15 07:33:23'),
(37, 8, 0, NULL, NULL, NULL, NULL, 'ESC202602150F3803', 'ESC202602150F3803', 'shipped', 'pending', 'cib_bank', 0.00, 50.00, 0.00, 4050.00, 'EGP', 37, 37, '', NULL, NULL, NULL, NULL, '2026-02-15 07:41:04', '2026-02-15 09:16:48'),
(38, 8, 0, NULL, NULL, NULL, NULL, 'ESC202602154751F8', 'ESC202602154751F8', 'shipped', 'pending', 'cash_on_delivery', 0.00, 50.00, 0.00, 2050.00, 'EGP', 38, 38, '', NULL, NULL, NULL, NULL, '2026-02-15 08:25:24', '2026-02-15 09:30:33'),
(39, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260302E0EE6A', 'ESC20260302E0EE6A', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 40, 40, '', NULL, NULL, NULL, NULL, '2026-03-01 23:08:46', '2026-03-01 23:08:46'),
(40, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260302F59028', 'ESC20260302F59028', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 41, 41, '', NULL, NULL, NULL, NULL, '2026-03-02 03:38:07', '2026-03-02 03:38:07'),
(41, 4, 0, NULL, NULL, NULL, NULL, 'ESC20260302B9243D', 'ESC20260302B9243D', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 42, 42, '', NULL, NULL, NULL, NULL, '2026-03-02 03:40:59', '2026-03-02 03:40:59'),
(42, 4, 0, NULL, NULL, NULL, NULL, 'ESC2026030210AE8B', 'ESC2026030210AE8B', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 43, 43, '', NULL, NULL, NULL, NULL, '2026-03-02 03:42:25', '2026-03-02 03:42:25'),
(43, 4, 0, NULL, NULL, NULL, NULL, 'ESC202603027B5FCE', 'ESC202603027B5FCE', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 45, 45, '', NULL, NULL, NULL, NULL, '2026-03-02 03:47:35', '2026-03-02 03:47:35'),
(44, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306F51A1D', 'ESC20260306F51A1D', 'pending', 'pending', 'cash_on_delivery', 4000.00, 50.00, 0.00, 4050.00, 'EGP', 46, 46, '', NULL, NULL, NULL, NULL, '2026-03-05 22:15:11', '2026-03-05 22:15:11'),
(45, 8, 0, NULL, NULL, NULL, NULL, 'ESC2026030658CEC2', 'ESC2026030658CEC2', 'pending', 'pending', 'cash_on_delivery', 4012.00, 50.00, 0.00, 4062.00, 'EGP', 47, 47, '', NULL, NULL, NULL, NULL, '2026-03-06 00:17:41', '2026-03-06 00:17:41'),
(46, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603067934ED', 'ESC202603067934ED', 'pending', 'pending', 'cib_bank', 12.00, 50.00, 0.00, 62.00, 'EGP', 48, 48, '', NULL, NULL, NULL, NULL, '2026-03-06 00:26:31', '2026-03-06 00:26:31'),
(47, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306B2FFC4', 'ESC20260306B2FFC4', 'processing', 'pending', 'cib_bank', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 49, 49, '', NULL, NULL, NULL, NULL, '2026-03-06 00:40:27', '2026-03-06 00:43:11'),
(48, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306521EA4', 'ESC20260306521EA4', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 50, 50, '', NULL, NULL, NULL, NULL, '2026-03-06 00:48:21', '2026-03-06 00:48:21'),
(49, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603060307D9', 'ESC202603060307D9', 'processing', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 51, 51, '', NULL, NULL, NULL, NULL, '2026-03-06 00:58:24', '2026-03-06 01:00:55'),
(50, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306A4F1AA', 'ESC20260306A4F1AA', 'pending', 'pending', 'cash_on_delivery', 2000.00, 50.00, 0.00, 2050.00, 'EGP', 52, 52, '', NULL, NULL, NULL, NULL, '2026-03-06 01:04:58', '2026-03-06 01:04:58'),
(51, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603061614E6', 'ESC202603061614E6', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 53, 53, '', NULL, NULL, NULL, NULL, '2026-03-06 01:13:53', '2026-03-06 01:13:53'),
(52, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306E786AC', 'ESC20260306E786AC', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 54, 54, '', NULL, NULL, NULL, NULL, '2026-03-06 01:16:30', '2026-03-06 01:16:30'),
(53, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306F2576E', 'ESC20260306F2576E', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 56, 56, '', NULL, NULL, NULL, NULL, '2026-03-06 01:17:19', '2026-03-06 01:17:19'),
(54, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306060E34', 'ESC20260306060E34', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 58, 58, '', NULL, NULL, NULL, NULL, '2026-03-06 01:18:56', '2026-03-06 01:18:56'),
(55, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603069D36AB', 'ESC202603069D36AB', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 59, 59, '', NULL, NULL, NULL, NULL, '2026-03-06 01:44:25', '2026-03-06 01:44:25'),
(56, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306626EF2', 'ESC20260306626EF2', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 60, 60, '', NULL, NULL, NULL, NULL, '2026-03-06 01:54:14', '2026-03-06 01:54:14'),
(57, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603065A441F', 'ESC202603065A441F', 'pending', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 61, 61, '', NULL, NULL, NULL, NULL, '2026-03-06 03:17:41', '2026-03-06 03:17:41'),
(58, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260306BD708B', 'ESC20260306BD708B', 'processing', 'pending', 'cash_on_delivery', 2000.00, 70.00, 0.00, 2070.00, 'EGP', 62, 62, '', NULL, NULL, NULL, NULL, '2026-03-06 03:21:15', '2026-03-06 03:23:21'),
(59, 8, 0, NULL, NULL, NULL, NULL, 'ESC2026031089B61F', 'ESC2026031089B61F', 'pending', 'pending', 'cash_on_delivery', 12.00, 300.00, 0.00, 312.00, 'EGP', 63, 63, '', NULL, NULL, NULL, NULL, '2026-03-10 04:59:20', '2026-03-10 04:59:20'),
(60, 4, 0, NULL, NULL, NULL, NULL, 'ESC202603114CE678', 'ESC202603114CE678', 'pending', 'pending', 'cash_on_delivery', 213123.00, 60.00, 0.00, 213183.00, 'EGP', 64, 64, '', NULL, NULL, NULL, NULL, '2026-03-11 05:07:16', '2026-03-11 05:07:16'),
(61, 8, 0, NULL, NULL, NULL, NULL, 'ESC202603123BD315', 'ESC202603123BD315', 'pending', 'pending', 'cash_on_delivery', 123.00, 50.00, 0.00, 173.00, 'EGP', 65, 65, '', NULL, NULL, NULL, NULL, '2026-03-12 20:32:19', '2026-03-12 20:32:19'),
(62, 11, 0, NULL, NULL, NULL, NULL, 'ESC20260312B639C1', 'ESC20260312B639C1', 'pending', 'pending', 'cash_on_delivery', 123.00, 60.00, 0.00, 183.00, 'EGP', 66, 66, '', NULL, NULL, NULL, NULL, '2026-03-12 21:00:27', '2026-03-12 21:00:27'),
(63, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260313E71BCA', 'ESC20260313E71BCA', 'pending', 'pending', 'cash_on_delivery', 135.00, 50.00, 0.00, 185.00, 'EGP', 67, 67, '', NULL, NULL, NULL, NULL, '2026-03-13 03:34:06', '2026-03-13 03:34:06'),
(64, NULL, 0, NULL, NULL, NULL, NULL, 'ESC20260401BD0AF8', 'ESC20260401BD0AF8', 'pending', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 71, 71, '', NULL, NULL, NULL, NULL, '2026-04-01 21:57:15', '2026-04-01 21:57:15'),
(65, NULL, 0, NULL, NULL, NULL, NULL, 'ESC2026040136DF21', 'ESC2026040136DF21', 'pending', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 72, 72, '', NULL, NULL, NULL, NULL, '2026-04-01 21:57:23', '2026-04-01 21:57:23'),
(66, NULL, 0, NULL, NULL, NULL, NULL, 'ESC202604014A6B79', 'ESC202604014A6B79', 'pending', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 73, 73, '', NULL, NULL, NULL, NULL, '2026-04-01 21:57:24', '2026-04-01 21:57:24'),
(67, NULL, 0, NULL, NULL, NULL, NULL, 'ESC20260401986878', 'ESC20260401986878', 'pending', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 74, 74, '', NULL, NULL, NULL, NULL, '2026-04-01 21:57:29', '2026-04-01 21:57:29'),
(68, NULL, 0, NULL, NULL, NULL, NULL, 'ESC2026040178A7D4', 'ESC2026040178A7D4', 'processing', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 75, 75, '', NULL, NULL, NULL, NULL, '2026-04-01 21:57:59', '2026-04-01 21:59:25'),
(69, NULL, 0, NULL, NULL, NULL, NULL, 'ESC20260402302194', 'ESC20260402302194', 'processing', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 76, 76, '', NULL, NULL, NULL, NULL, '2026-04-01 22:04:03', '2026-04-01 22:11:35'),
(70, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260402B17AA3', 'ESC20260402B17AA3', 'pending', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 77, 77, '', NULL, NULL, NULL, NULL, '2026-04-01 22:33:31', '2026-04-01 22:33:31'),
(71, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260402C0E62C', 'ESC20260402C0E62C', 'processing', 'pending', 'cash_on_delivery', 12.00, 60.00, 0.00, 72.00, 'EGP', 78, 78, '', NULL, NULL, NULL, NULL, '2026-04-02 09:29:16', '2026-04-02 09:38:59'),
(72, 8, 0, NULL, NULL, NULL, NULL, 'ESC20260402A6F4D8', 'ESC20260402A6F4D8', 'pending', 'pending', 'cash_on_delivery', 369.00, 50.00, 0.00, 419.00, 'EGP', 79, 79, '', NULL, NULL, NULL, NULL, '2026-04-02 09:47:06', '2026-04-02 09:47:06'),
(73, 8, 0, NULL, NULL, NULL, NULL, 'ESC2026040239F5EA', 'ESC2026040239F5EA', 'pending', 'pending', 'cash_on_delivery', 213123.00, 60.00, 0.00, 213183.00, 'EGP', 80, 80, '', NULL, NULL, NULL, NULL, '2026-04-02 11:01:23', '2026-04-02 11:01:23'),
(74, 8, 1, 'saidsalah375@gmail.com', '01066536008', 'Said Ali', 'a56415d8ae0a099679a346e979998d0a845cdd176a95261d1e4f80887bf25937', 'ESC202604023A901C', 'ESC202604023A901C', 'pending', 'pending', 'cash_on_delivery', 123.00, 60.00, 0.00, 183.00, 'EGP', 81, 81, '', NULL, NULL, NULL, NULL, '2026-04-02 11:06:27', '2026-04-02 11:06:27');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `variant_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `variant_name` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `scanned_quantity` int(11) DEFAULT 0,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `product_name`, `variant_name`, `barcode`, `sku`, `quantity`, `scanned_quantity`, `price`, `subtotal`, `created_at`) VALUES
(28, 23, 19, 93, 'Gym Ready Set', 'size: XL / color: blue', NULL, NULL, 1, 0, 1200.00, 1200.00, '2026-01-05 12:34:28'),
(29, 24, 19, 101, 'Gym Ready Set', 'size: XL / color: blue', NULL, NULL, 1, 0, 1200.00, 1200.00, '2026-01-05 13:29:04'),
(30, 25, 19, 101, 'Gym Ready Set', 'size: XL / color: blue', NULL, NULL, 1, 0, 1200.00, 1200.00, '2026-01-05 14:15:59'),
(31, 26, 20, 114, 'test', 'size: L / color: blue', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 18:24:52'),
(32, 27, 20, 114, 'test', 'size: L / color: blue', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 18:25:50'),
(33, 28, 20, 124, 'test', 'size: L / color: blue', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 18:40:39'),
(34, 29, 20, 138, 'test', 'size: XL / color: black', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 19:42:51'),
(35, 30, 20, 136, 'test', 'size: L / color: blue', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 19:53:35'),
(36, 30, 20, 137, 'test', 'size: L / color: black', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 19:53:35'),
(37, 31, 20, 136, 'test', 'size: L / color: blue', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 20:42:15'),
(38, 31, 20, 138, 'test', 'size: XL / color: black', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 20:42:15'),
(39, 31, 20, 139, 'test', 'size: XXL / color: red', NULL, NULL, 1, 0, 1000.00, 1000.00, '2026-01-07 20:42:15'),
(40, 32, 19, 208, 'Modest Sportswear Set for Hijabi Women – Comfort & Confidence inEvery Move', 'size: XXL / color: red', '6220000190000208', '21', 1, 0, 1200.00, 1200.00, '2026-02-10 21:19:03'),
(41, 32, 21, 213, 'Gym Ready Set', 'size: M / color: black', '6220000210000213', '3', 1, 0, 2000.00, 2000.00, '2026-02-10 21:19:03'),
(42, 33, 19, 206, 'Modest Sportswear Set for Hijabi Women – Comfort & Confidence inEvery Move', 'size: XL / color: blue', '6220000190000206', '12', 1, 0, 1200.00, 1200.00, '2026-02-10 21:22:07'),
(43, 33, 21, 212, 'Gym Ready Set', 'size: L / color: blue', '6220000210000212', '3', 1, 0, 2000.00, 2000.00, '2026-02-10 21:22:07'),
(44, 34, 19, 219, 'Modest Sportswear Set for Hijabi Women – Comfort & Confidence inEvery Move', 'size: XXL / color: blue', '6220000190000219', '12', 1, 0, 1200.00, 1200.00, '2026-02-14 15:39:11'),
(45, 34, 21, 212, 'Gym Ready Set', 'size: L / color: blue', '6220000210000212', '3', 2, 0, 2000.00, 4000.00, '2026-02-14 15:39:11'),
(46, 35, 19, 221, 'Modest Sportswear Set for Hijabi Women – Comfort & Confidence inEvery Move', 'size: L / color: blue', '6220000190000221', '12', 1, 0, 1200.00, 1200.00, '2026-02-14 15:41:57'),
(47, 35, 21, 212, 'Gym Ready Set', 'size: L / color: blue', '6220000210000212', '3', 1, 0, 2000.00, 2000.00, '2026-02-14 15:41:57'),
(48, 36, 21, 213, 'Gym Ready Set', 'size: M / color: black', '6220000210000213', '3', 14, 0, 2000.00, 28000.00, '2026-02-15 07:33:23'),
(49, 37, 21, 212, 'Gym Ready Set', 'size: L / color: blue', '6220000210000212', '3', 2, 0, 2000.00, 4000.00, '2026-02-15 07:41:05'),
(50, 38, 21, 212, 'Gym Ready Set', 'size: L / color: blue', '6220000210000212', '3', 1, 0, 2000.00, 2000.00, '2026-02-15 08:25:24'),
(51, 39, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-01 23:08:46'),
(52, 40, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-02 03:38:07'),
(53, 41, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-02 03:40:59'),
(54, 42, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-02 03:42:25'),
(55, 43, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-02 03:47:35'),
(56, 44, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 2, 0, 2000.00, 4000.00, '2026-03-05 22:15:11'),
(57, 45, 22, 268, 'said', 'اسود / L', '6220000220000268', NULL, 1, 0, 12.00, 12.00, '2026-03-06 00:17:41'),
(58, 45, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 2, 0, 2000.00, 4000.00, '2026-03-06 00:17:41'),
(59, 46, 22, 268, 'said', 'اسود / L', '6220000220000268', NULL, 1, 0, 12.00, 12.00, '2026-03-06 00:26:31'),
(60, 47, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 00:40:27'),
(61, 48, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 00:48:21'),
(62, 49, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 00:58:24'),
(63, 50, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:04:58'),
(64, 51, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:13:53'),
(65, 52, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:16:30'),
(66, 53, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:17:19'),
(67, 54, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:18:56'),
(68, 55, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:44:25'),
(69, 56, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 01:54:14'),
(70, 57, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 03:17:41'),
(71, 58, 21, 259, 'Gym Ready Set', 'blue / L', '6220000210000259', '3', 1, 0, 2000.00, 2000.00, '2026-03-06 03:21:15'),
(72, 59, 22, 296, 'said', 'اسود / L', '6220000220000296', NULL, 1, 0, 12.00, 12.00, '2026-03-10 04:59:20'),
(73, 60, 24, 347, 'said', '234324 / S', '6220000240000347', NULL, 1, 0, 213123.00, 213123.00, '2026-03-11 05:07:16'),
(74, 61, 23, 277, 'saidsdasdasd', 're / S', '6220000230000277', NULL, 1, 0, 123.00, 123.00, '2026-03-12 20:32:19'),
(75, 62, 23, 277, 'saidsdasdasd', 're / S', '6220000230000277', NULL, 1, 0, 123.00, 123.00, '2026-03-12 21:00:27'),
(76, 63, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-03-13 03:34:06'),
(77, 63, 23, 277, 'saidsdasdasd', 're / S', '6220000230000277', NULL, 1, 0, 123.00, 123.00, '2026-03-13 03:34:06'),
(78, 64, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 21:57:15'),
(79, 65, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 21:57:23'),
(80, 66, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 21:57:24'),
(81, 67, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 21:57:29'),
(82, 68, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 21:57:59'),
(83, 69, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 22:04:03'),
(84, 70, 22, 394, 'said', 'اسود / L', '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-01 22:33:31'),
(85, 71, 22, 394, 'said', NULL, '6220000220000394', NULL, 1, 0, 12.00, 12.00, '2026-04-02 09:29:16'),
(86, 72, 23, 277, 'saidsdasdasd', 're / S', '6220000230000277', NULL, 3, 0, 123.00, 369.00, '2026-04-02 09:47:06'),
(87, 73, 24, 347, 'said', NULL, '6220000240000347', NULL, 1, 0, 213123.00, 213123.00, '2026-04-02 11:01:23'),
(88, 74, 23, 277, 'saidsdasdasd', NULL, '6220000230000277', NULL, 1, 0, 123.00, 123.00, '2026-04-02 11:06:27');

-- --------------------------------------------------------

--
-- Table structure for table `order_returns`
--

CREATE TABLE `order_returns` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `order_item_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','refunded') DEFAULT 'pending',
  `scanned_barcodes` text DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT 0.00,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_returns`
--

INSERT INTO `order_returns` (`id`, `order_id`, `order_item_id`, `quantity`, `reason`, `status`, `scanned_barcodes`, `refund_amount`, `created_by`, `created_at`, `updated_at`) VALUES
(6, 26, 31, 1, NULL, 'pending', '[]', 1000.00, 8, '2026-01-07 18:27:23', '2026-01-07 18:27:23'),
(7, 26, 31, 1, NULL, 'pending', '[]', 1000.00, 8, '2026-01-07 18:27:57', '2026-01-07 18:27:57'),
(8, 27, 32, 1, NULL, 'pending', '[]', 1000.00, 8, '2026-01-07 18:31:05', '2026-01-07 18:31:05'),
(9, 28, 33, 1, NULL, 'approved', '[]', 1000.00, 8, '2026-01-07 18:42:52', '2026-01-07 18:42:52'),
(10, 28, 33, 1, 'سيشسي', 'approved', '[]', 1000.00, 8, '2026-01-07 18:46:30', '2026-01-07 18:46:30'),
(11, 29, 34, 1, NULL, 'approved', '[]', 1000.00, 8, '2026-01-07 19:44:52', '2026-01-07 19:44:52'),
(12, 30, 36, 1, NULL, 'approved', '[]', 1000.00, 8, '2026-01-07 19:54:47', '2026-01-07 19:54:47'),
(13, 30, 35, 1, NULL, 'approved', '[]', 1000.00, 8, '2026-01-07 19:54:47', '2026-01-07 19:54:47'),
(22, 35, 46, 1, NULL, 'approved', '[]', 1200.00, 8, '2026-02-14 15:45:26', '2026-02-14 15:45:26');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_gateway` varchar(50) DEFAULT 'cib_bank',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'EGP',
  `status` enum('pending','success','failed','cancelled','refunded') DEFAULT 'pending',
  `gateway_response` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `order_id`, `transaction_id`, `payment_gateway`, `amount`, `currency`, `status`, `gateway_response`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 8, NULL, 'cib_bank', 95.60, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC2025112073D772\",\"amount\":\"95.60\",\"currency\":\"EGP\",\"return_url\":\"http:\\/\\/localhost:5173\\/payment\\/callback\",\"cancel_url\":\"http:\\/\\/localhost:5173\\/payment\\/cancel\",\"customer_email\":\"saidsalah375@gmail.com\",\"timestamp\":1763668055,\"hash\":\"65ea013505800693bc5258ae20f3ef9818f562f53159cb056343ac363e9e5f66\"}', '::1', '2025-11-20 19:47:35', '2025-11-20 19:47:35'),
(2, 12, NULL, 'cib_bank', 97.88, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC20251121F198AC\",\"amount\":\"97.88\",\"currency\":\"EGP\",\"return_url\":\"https:\\/\\/escwear.com\\/payment\\/callback\",\"cancel_url\":\"https:\\/\\/escwear.com\\/payment\\/cancel\",\"customer_email\":\"admin@escwear.com\",\"timestamp\":1763685183,\"hash\":\"d8cbf9f7690149023417d9c22bc25d60fccfc6483f30d76cc24d0194705312e0\"}', '::1', '2025-11-21 00:33:03', '2025-11-21 00:33:03'),
(3, 13, NULL, 'cib_bank', 73.94, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC20251121A14328\",\"amount\":\"73.94\",\"currency\":\"EGP\",\"return_url\":\"https:\\/\\/escwear.com\\/payment\\/callback\",\"cancel_url\":\"https:\\/\\/escwear.com\\/payment\\/cancel\",\"customer_email\":\"admin@escwear.com\",\"timestamp\":1763729306,\"hash\":\"f4da760db0d1cb5c90bdf61d07494dfdb82133c045f33352a322f0c858bea25c\"}', '::1', '2025-11-21 12:48:26', '2025-11-21 12:48:26'),
(4, 15, NULL, 'cib_bank', 121.82, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC20251121C9260F\",\"amount\":\"121.82\",\"currency\":\"EGP\",\"return_url\":\"http:\\/\\/localhost:5173\\/payment\\/callback\",\"cancel_url\":\"http:\\/\\/localhost:5173\\/payment\\/cancel\",\"customer_email\":\"admin@escwear.com\",\"timestamp\":1763732684,\"hash\":\"908b93f2a82ac9ac26273ee74af0686dae3fee6eb7efdda85587a5277d609bba\"}', '::1', '2025-11-21 13:44:44', '2025-11-21 13:44:44'),
(5, 16, NULL, 'cib_bank', 114.98, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC20251121025CD5\",\"amount\":\"114.98\",\"currency\":\"EGP\",\"return_url\":\"http:\\/\\/localhost:5173\\/payment\\/callback\",\"cancel_url\":\"http:\\/\\/localhost:5173\\/payment\\/cancel\",\"customer_email\":\"admin@escwear.com\",\"timestamp\":1763737024,\"hash\":\"be596f19ca002551cba3470f739ccc19c3b3b14f98c77fc2f7869d7662c17204\"}', '::1', '2025-11-21 14:57:04', '2025-11-21 14:57:04'),
(6, 22, NULL, 'cib_bank', 2102.00, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC202512018EA8E6\",\"amount\":\"2102.00\",\"currency\":\"EGP\",\"return_url\":\"http:\\/\\/localhost:5173\\/payment\\/callback\",\"cancel_url\":\"http:\\/\\/localhost:5173\\/payment\\/cancel\",\"customer_email\":\"saidsalaha2000@gmail.com\",\"timestamp\":1764548121,\"hash\":\"cd8a5acd7ca11b3c0f2dd043af2a3ac29481b6f9ee9a44aac08547d79b16f2ca\"}', '102.46.68.121', '2025-12-01 00:15:21', '2025-12-01 00:15:21'),
(7, 23, NULL, 'cib_bank', 1418.00, 'EGP', 'pending', '{\"merchant_id\":\"\",\"order_id\":\"ESC202601054A27AE\",\"amount\":\"1418.00\",\"currency\":\"EGP\",\"return_url\":\"http:\\/\\/localhost:5173\\/payment\\/callback\",\"cancel_url\":\"http:\\/\\/localhost:5173\\/payment\\/cancel\",\"customer_email\":\"saidsalah375@gmail.com\",\"timestamp\":1767616468,\"hash\":\"7860cad436e83213e9fc7018613a7df5c0c23088f4607cb0d0d77a027d0543dd\"}', '::1', '2026-01-05 12:34:28', '2026-01-05 12:34:28');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `brand_ar` varchar(100) DEFAULT NULL,
  `main_image` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `sales_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `name_ar`, `slug`, `description`, `description_ar`, `short_description`, `price`, `sale_price`, `sku`, `barcode`, `stock_quantity`, `category_id`, `brand`, `brand_ar`, `main_image`, `is_featured`, `is_active`, `weight`, `dimensions`, `meta_title`, `meta_description`, `views_count`, `sales_count`, `created_at`, `updated_at`) VALUES
(22, 'said', 'طقم جاهز للجيم', 'said', 'يشسيشي', 'يسشيشي', NULL, 12.00, NULL, NULL, '6220000000022', 19, 5, NULL, NULL, '/uploads/products/69aeeb842304e_1773071236.JPG', 1, 1, NULL, NULL, NULL, NULL, 254, 0, '2026-03-06 00:06:29', '2026-04-02 09:32:03'),
(23, 'saidsdasdasd', 'dasdsadad', 'saidsdasdasd', 'dsdasd', 'dsadasdd', NULL, 123.00, NULL, NULL, '6220000000023', 12, 5, NULL, NULL, '/uploads/products/69aee81e1f192_1773070366.JPG', 0, 1, NULL, NULL, NULL, NULL, 70, 0, '2026-03-09 15:32:27', '2026-04-02 11:28:13'),
(24, 'said', 'sdasdasd', 'saidsdasddsdasdsd', 'sadasd', 'dsadssad', NULL, 213123.00, NULL, NULL, '6220000000024', 32, 5, NULL, NULL, '/uploads/products/69aee87fe6a25_1773070463.JPG', 0, 1, NULL, NULL, NULL, NULL, 63, 0, '2026-03-09 15:34:16', '2026-04-02 10:42:59');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `color_variant_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `color_value` varchar(100) DEFAULT NULL COMMENT 'اللون المرتبط بهذه الصورة — NULL = صورة عامة للمنتج',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `color_variant_id`, `image_url`, `color_value`, `sort_order`, `created_at`) VALUES
(2, 15, NULL, '/uploads/products/691b3ffcc8eb8_1763393532.png', NULL, 1, '2025-11-17 15:32:12'),
(8, 16, NULL, '/uploads/products/691b9bd9e566a_1763417049.png', NULL, 1, '2025-11-17 22:04:09'),
(9, 16, NULL, '/uploads/products/691b9bd9e6b5f_1763417049.png', NULL, 2, '2025-11-17 22:04:09'),
(10, 16, NULL, '/uploads/products/691b9bd9e772d_1763417049.png', NULL, 3, '2025-11-17 22:04:09'),
(14, 5, NULL, '/uploads/products/6922387feeeba_1763850367.jpg', NULL, 1, '2025-11-22 22:26:07'),
(15, 5, NULL, '/uploads/products/6922387fefa63_1763850367.jpg', NULL, 2, '2025-11-22 22:26:07'),
(16, 5, NULL, '/uploads/products/6922387ff06a2_1763850367.jpg', NULL, 3, '2025-11-22 22:26:07'),
(17, 5, NULL, '/uploads/products/6922387ff11a2_1763850367.jpg', NULL, 4, '2025-11-22 22:26:07'),
(18, 18, NULL, '/uploads/products/69223edc50a05_1763851996.jpg', NULL, 1, '2025-11-22 22:53:16'),
(19, 18, NULL, '/uploads/products/69223edc51c30_1763851996.png', NULL, 2, '2025-11-22 22:53:16'),
(22, 20, NULL, '/uploads/products/695ea14460cc4_1767809348.jpg', NULL, 1, '2026-01-07 18:09:08'),
(27, 21, NULL, '/uploads/products/698b89dba8bd8_1770752475.jpg', NULL, 1, '2026-02-10 19:41:15'),
(28, 21, NULL, '/uploads/products/698b89dba9594_1770752475.jpg', NULL, 2, '2026-02-10 19:41:15'),
(29, 21, NULL, '/uploads/products/698b89dba9f74_1770752475.jpg', NULL, 3, '2026-02-10 19:41:15'),
(30, 22, NULL, '/uploads/products/69aa1a85c8340_1772755589.JPG', NULL, 3, '2026-03-06 00:06:29'),
(31, 22, NULL, '/uploads/products/69aa1a85c97a8_1772755589.JPG', NULL, 4, '2026-03-06 00:06:29'),
(32, 22, NULL, '/uploads/products/69aa1a85caa01_1772755589.JPG', NULL, 5, '2026-03-06 00:06:29');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL,
  `size_value` varchar(50) DEFAULT NULL,
  `color_value` varchar(100) DEFAULT NULL,
  `hex` varchar(7) DEFAULT NULL,
  `price_modifier` decimal(10,2) DEFAULT 0.00,
  `stock_quantity` int(11) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `name`, `value`, `size_value`, `color_value`, `hex`, `price_modifier`, `stock_quantity`, `sku`, `barcode`, `created_at`, `updated_at`) VALUES
(7, 15, 'size', 'M', 'M', NULL, NULL, 0.00, 0, NULL, NULL, '2025-11-17 15:34:06', '2025-11-22 22:43:07'),
(8, 15, 'size', 'S', 'S', NULL, NULL, 0.00, 1, NULL, NULL, '2025-11-17 15:34:06', '2026-02-14 15:35:24'),
(9, 15, 'color', 'Red', NULL, 'Red', NULL, 2.00, 2, NULL, NULL, '2025-11-17 15:34:06', '2025-11-22 22:43:07'),
(24, 16, 'size', 'M', 'M', NULL, NULL, 10.00, 0, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(25, 16, 'size', 'S', 'S', NULL, NULL, 12.00, 1, NULL, NULL, '2025-11-17 22:14:52', '2026-01-08 00:13:42'),
(26, 16, 'size', 'L', 'L', NULL, NULL, 0.00, 0, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(27, 16, 'size', 'XXL', 'XXL', NULL, NULL, 0.00, 0, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(28, 16, 'size', 'XL', 'XL', NULL, NULL, 0.00, 0, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(29, 16, 'color', 'blue', NULL, 'blue', NULL, 12.00, 12, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(30, 16, 'color', 'red', NULL, 'red', NULL, 2.00, 12, NULL, NULL, '2025-11-17 22:14:52', '2025-11-22 22:43:07'),
(39, 18, 'combination', 'M-red', 'M', 'red', NULL, 50.00, 49, 'res', NULL, '2025-11-22 22:56:24', '2025-11-22 22:56:24'),
(40, 18, 'combination', 'S-red', 'S', 'red', NULL, 2.00, 5, NULL, NULL, '2025-11-22 22:56:24', '2025-11-22 22:56:24'),
(41, 15, 'combination', 'M / Red', 'M', 'Red', NULL, 0.00, 0, 'comb-7-9', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(42, 15, 'combination', 'S / Red', 'S', 'Red', NULL, 0.00, 0, 'comb-8-9', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(43, 16, 'combination', 'M / blue', 'M', 'blue', NULL, 0.00, 0, 'comb-24-29', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(44, 16, 'combination', 'S / blue', 'S', 'blue', NULL, 0.00, 0, 'comb-25-29', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(45, 16, 'combination', 'L / blue', 'L', 'blue', NULL, 0.00, 0, 'comb-26-29', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(46, 16, 'combination', 'XXL / blue', 'XXL', 'blue', NULL, 0.00, 0, 'comb-27-29', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(47, 16, 'combination', 'XL / blue', 'XL', 'blue', NULL, 0.00, 0, 'comb-28-29', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(48, 16, 'combination', 'M / red', 'M', 'red', NULL, 0.00, 0, 'comb-24-30', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(49, 16, 'combination', 'S / red', 'S', 'red', NULL, 0.00, 0, 'comb-25-30', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(50, 16, 'combination', 'L / red', 'L', 'red', NULL, 0.00, 0, 'comb-26-30', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(51, 16, 'combination', 'XXL / red', 'XXL', 'red', NULL, 0.00, 0, 'comb-27-30', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(52, 16, 'combination', 'XL / red', 'XL', 'red', NULL, 0.00, 0, 'comb-28-30', NULL, '2025-11-30 22:57:46', '2025-11-30 22:57:46'),
(161, 20, 'size', 'L', 'L', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(162, 20, 'size', 'XL', 'XL', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(163, 20, 'size', 'XXL', 'XXL', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(164, 20, 'combination', 'L / black', 'L', 'black', '#000000', 0.00, 22, '2', '6220000200000164', '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(165, 20, 'combination', 'L / blue', 'L', 'blue', '#240fc7', 0.00, 4, '2', '6220000200000165', '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(166, 20, 'combination', 'XL / black', 'XL', 'black', '#000000', 0.00, 1, NULL, '6220000200000166', '2026-01-08 00:03:32', '2026-01-08 00:03:32'),
(167, 20, 'combination', 'XXL / red', 'XXL', 'red', '#f50505', 0.00, 1, NULL, '6220000200000167', '2026-01-08 00:03:32', '2026-01-08 00:03:33'),
(173, 5, 'size', 'L', 'L', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:16:11', '2026-01-08 00:16:11'),
(174, 5, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:16:11', '2026-01-08 00:16:11'),
(175, 5, 'size', 'XXL', 'XXL', NULL, NULL, 0.00, 0, NULL, NULL, '2026-01-08 00:16:11', '2026-01-08 00:16:11'),
(176, 5, 'combination', 'L / سيشسي', 'L', 'سيشسي', '#e51f1f', 0.00, 20, NULL, '6220000050000176', '2026-01-08 00:16:11', '2026-01-08 00:16:11'),
(256, 21, 'size', 'L', 'L', NULL, NULL, 0.00, 0, '3', NULL, '2026-02-15 11:16:05', '2026-02-15 11:16:05'),
(257, 21, 'size', 'M', 'M', NULL, NULL, 0.00, 0, '3', NULL, '2026-02-15 11:16:05', '2026-02-15 11:16:05'),
(258, 21, 'size', 'XL', 'XL', NULL, NULL, 0.00, 0, '2', NULL, '2026-02-15 11:16:05', '2026-02-15 11:16:05'),
(259, 21, 'combination', 'L / blue', 'L', 'blue', '#0400ff', 0.00, 2, '3', '6220000210000259', '2026-02-15 11:16:05', '2026-03-06 03:21:15'),
(260, 21, 'combination', 'M / black', 'M', 'black', '#000000', 0.00, 15, '3', '6220000210000260', '2026-02-15 11:16:05', '2026-02-15 11:16:05'),
(261, 21, 'combination', 'XL / red', 'XL', 'red', '#fb0404', 0.00, 30, '2', '6220000210000261', '2026-02-15 11:16:05', '2026-02-15 11:16:05'),
(276, 23, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-09 15:32:46', '2026-03-09 15:32:46'),
(277, 23, 'combination', 'S / re', 'S', 're', '#8c2c2c', 0.00, 12, NULL, '6220000230000277', '2026-03-09 15:32:46', '2026-04-02 11:06:27'),
(346, 24, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-10 00:50:39', '2026-03-10 00:50:39'),
(347, 24, 'combination', 'S / 234324', 'S', '234324', '#6e1212', 0.00, 30, NULL, '6220000240000347', '2026-03-10 00:50:39', '2026-04-02 11:01:23'),
(372, 19, 'size', 'L', 'L', NULL, NULL, 0.00, 0, '12', NULL, '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(373, 19, 'size', 'M', 'M', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(374, 19, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(375, 19, 'size', 'XL', 'XL', NULL, NULL, 0.00, 0, '12', NULL, '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(376, 19, 'size', 'XXL', 'XXL', NULL, NULL, 0.00, 0, '21', NULL, '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(377, 19, 'combination', 'L / black', 'L', 'black', '#9f2828', 0.00, 1, '12-black', '6220000190000377', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(378, 19, 'combination', 'L / blue', 'L', 'blue', '#270bf9', 0.00, 2, '12', '6220000190000378', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(379, 19, 'combination', 'M / black', 'M', 'black', '#9f2828', 0.00, 2, NULL, '6220000190000379', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(380, 19, 'combination', 'S / black', 'S', 'black', '#9f2828', 0.00, 2, NULL, '6220000190000380', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(381, 19, 'combination', 'XL / blue', 'XL', 'blue', '#270bf9', 0.00, 2, '12', '6220000190000381', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(382, 19, 'combination', 'XXL / blue', 'XXL', 'blue', '#270bf9', 0.00, 2, '12', '6220000190000382', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(383, 19, 'combination', 'XXL / red', 'XXL', 'red', '#ec0909', 0.00, 2, '21', '6220000190000383', '2026-03-11 06:01:24', '2026-03-11 06:01:24'),
(392, 22, 'size', 'L', 'L', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-11 06:02:20', '2026-03-11 06:02:20'),
(393, 22, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-03-11 06:02:20', '2026-03-11 06:02:20'),
(394, 22, 'combination', 'L / اسود', 'L', 'اسود', '#000000', 0.00, 4, NULL, '6220000220000394', '2026-03-11 06:02:20', '2026-04-02 09:29:16'),
(395, 22, 'combination', 'S / احمر', 'S', 'احمر', '#211c1c', 0.00, 2, NULL, '6220000220000395', '2026-03-11 06:02:20', '2026-03-11 06:02:20'),
(396, 25, 'size', 'S', 'S', NULL, NULL, 0.00, 0, NULL, NULL, '2026-04-02 11:56:05', '2026-04-02 11:56:05'),
(397, 25, 'size', 'Srwer', 'Srwer', NULL, NULL, 0.00, 0, NULL, NULL, '2026-04-02 11:56:05', '2026-04-02 11:56:05'),
(398, 25, 'combination', 'S / test', 'S', 'test', '#a62b2b', 0.00, 20, NULL, '6220000250000398', '2026-04-02 11:56:05', '2026-04-02 11:56:06'),
(399, 25, 'combination', 'S / test', 'S', 'test', '#a62b2b', 0.00, 0, NULL, '6220000250000399', '2026-04-02 11:56:06', '2026-04-02 11:56:06'),
(400, 25, 'combination', 'S / test', 'S', 'test', '#a62b2b', 0.00, 0, NULL, '6220000250000400', '2026-04-02 11:56:06', '2026-04-02 11:56:06'),
(401, 25, 'combination', 'Srwer / sadew', 'Srwer', 'sadew', '#ae2d2d', 0.00, 23, NULL, '6220000250000401', '2026-04-02 11:56:06', '2026-04-02 11:56:06');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `is_verified_purchase`, `is_approved`, `created_at`, `updated_at`) VALUES
(4, 15, 2, 5, 'يشسيس', 'شيشييشسييسشيسشي', 1, 1, '2025-11-18 22:43:36', '2025-11-18 22:43:36'),
(5, 16, 4, 4, 'dasdsad', 'asdsadsdasdadsdaddddasdad', 1, 1, '2025-11-18 23:10:24', '2025-11-18 23:12:09'),
(6, 16, 8, 5, 'sada', 'dasadsdadasd', 1, 1, '2025-12-01 00:14:21', '2025-12-01 00:25:33'),
(7, 21, 8, 3, 'روعة', 'خامات تحفة', 1, 1, '2026-02-10 21:53:00', '2026-02-10 21:53:29'),
(8, 19, 8, 1, 'المنتج وحش', 'الخمات وحشة', 1, 1, '2026-02-14 15:50:15', '2026-02-14 15:50:51');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key_name`, `value`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'ESC Wear', '2025-11-17 13:26:38', '2025-11-17 13:26:38'),
(2, 'site_description', 'Premium fashion store', '2025-11-17 13:26:38', '2025-11-17 13:26:38'),
(3, 'contact_email', 'info@escwear.com', '2025-11-17 13:26:38', '2025-11-17 13:26:38'),
(4, 'contact_phone', '+20 123 456 7890', '2025-11-17 13:26:38', '2025-11-17 13:26:38'),
(5, 'shipping_cost', '70', '2025-11-17 13:26:38', '2026-03-05 22:23:17'),
(7, 'currency', 'EGP', '2025-11-17 13:26:38', '2025-11-17 13:26:38');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_governorates`
--

CREATE TABLE `shipping_governorates` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_governorates`
--

INSERT INTO `shipping_governorates` (`id`, `name`, `name_ar`, `shipping_cost`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Cairo', 'القاهرة', 50.00, 1, 1, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(2, 'Giza', 'الجيزة', 50.00, 1, 2, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(3, 'Alexandria', 'الإسكندرية', 50.00, 1, 3, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(4, 'Beheira', 'البحيرة', 60.00, 1, 4, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(5, 'Kafr El-Sheikh', 'كفر الشيخ', 60.00, 1, 5, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(6, 'Damietta', 'دمياط', 60.00, 1, 6, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(7, 'Dakahlia', 'الدقهلية', 60.00, 1, 7, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(8, 'Menoufia', 'المنوفية', 60.00, 1, 8, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(9, 'Qalyubia', 'القليوبية', 60.00, 1, 9, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(10, 'Sharqia', 'الشرقية', 60.00, 1, 10, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(11, 'Port Said', 'بورسعيد', 60.00, 1, 11, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(12, 'Ismailia', 'الإسماعيلية', 60.00, 1, 12, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(13, 'Suez', 'السويس', 60.00, 1, 13, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(14, 'Beni Suef', 'بني سويف', 70.00, 1, 14, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(15, 'Fayoum', 'الفيوم', 300.00, 1, 15, '2026-03-10 04:48:22', '2026-03-10 04:57:21'),
(16, 'Minya', 'المنيا', 70.00, 1, 16, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(17, 'Assiut', 'أسيوط', 70.00, 1, 17, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(18, 'Sohag', 'سوهاج', 70.00, 1, 18, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(19, 'Qena', 'قنا', 70.00, 1, 19, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(20, 'Luxor', 'الأقصر', 90.00, 1, 20, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(21, 'Aswan', 'أسوان', 90.00, 1, 21, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(22, 'Red Sea', 'البحر الأحمر', 90.00, 1, 22, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(23, 'Matrouh', 'مطروح', 90.00, 1, 23, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(24, 'New Valley', 'الوادي الجديد', 90.00, 1, 24, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(25, 'North Sinai', 'شمال سيناء', 90.00, 1, 25, '2026-03-10 04:48:22', '2026-03-10 04:48:22'),
(26, 'South Sinai', 'جنوب سيناء', 90.00, 1, 26, '2026-03-10 04:48:22', '2026-03-10 04:48:22');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `provider` enum('local','google') DEFAULT 'local',
  `role` enum('admin','customer') DEFAULT 'customer',
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `preferred_language` varchar(5) DEFAULT 'en',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `password`, `google_id`, `provider`, `role`, `avatar`, `email_verified_at`, `is_active`, `preferred_language`, `last_login_at`, `created_at`, `updated_at`) VALUES
(2, 'Admin', 'User', 'admin@escwear.com', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, 'local', 'admin', NULL, NULL, 1, 'en', '2025-12-30 01:27:39', '2025-11-17 13:48:53', '2025-12-30 01:27:39'),
(3, 'Said', 'Ali', 'test@gmail.com', '01066536008', '$2y$12$xZzwMRGOAdNK9Zp7mLab/el5z0sMNoEDT21d7LawVMK5dOHOdiUMq', NULL, 'local', 'customer', NULL, NULL, 1, 'en', NULL, '2025-11-17 16:50:55', '2025-11-17 16:50:55'),
(4, 'Said', 'Salah', 'saidsalaha2000@gmail.com', '01066536008', '$2y$10$Kj/lYpF4/K.GZkBokvhkbe4kx/8aAq8OWyGZPBHlKracyD.M.a.VG', '114312463312908356085', 'google', 'customer', 'https://lh3.googleusercontent.com/a/ACg8ocLLibQrNZSUXzwzx1ygSVb_FQigbguiPeSDN6vlB8YeOmUIbw=s96-c', NULL, 1, 'en', '2026-03-11 05:02:37', '2025-11-17 20:27:24', '2026-03-11 05:02:37'),
(6, 'Said', 'Salah', 'saidsalahalia@gmail.com', NULL, '$2y$10$pWDaMsBV8R0B1LqOC5/YoeHfB9ZmknTpmR5auese9Hz6scZs5n9Ka', '115168228410682830381', 'google', 'customer', 'https://lh3.googleusercontent.com/a/ACg8ocKLkY4ijcPN0LEiSEZanZnzeZKeqwlYfGhPd7u_IibFuzee_w=s96-c', NULL, 1, 'en', '2025-11-17 20:31:43', '2025-11-17 20:31:22', '2025-11-17 20:31:43'),
(7, 'Said', 'Ali', 'test2@gmail.com', '01066536008', '$2y$12$4Yl4Pfta..8W2aFtSL4b1u8M2xeowYAkBPxpuIxoHKOBUb3xUfune', NULL, 'local', 'customer', NULL, NULL, 1, 'en', NULL, '2025-11-17 22:32:51', '2025-11-17 22:32:51'),
(8, 'Said', 'Salah', 'saidsalah375@gmail.com', '01066536008', '$2y$10$2/gcoTeFuib4gVpZjkiAUev.rgERMcG3hKfGNet96l8iGYdtGb7y2', '107959068957296890672', 'google', 'admin', 'https://lh3.googleusercontent.com/a/ACg8ocL1mi-5Qu_z08gCQaK4p-KBz1e3vKQx9Q1FHt6Z4_QMbnCNYFw_Rg=s96-c', NULL, 1, 'en', '2026-04-02 11:52:55', '2025-11-18 18:39:49', '2026-04-02 11:52:55'),
(9, 'ESC', 'Wear', 'escwearr@gmail.com', NULL, '$2y$10$FY7vJbK5zDNjGeM/W17zZuNKlLRr2NNXenoqstLPBT4OgFmWvKkIC', '101163940634419122147', 'google', 'customer', 'https://lh3.googleusercontent.com/a/ACg8ocL-QPkKfX5GMZPtVBGDxB4VpMJZwTsqWb1YEAu8qsKPhcPhTA=s96-c', NULL, 1, 'en', '2025-11-18 23:28:26', '2025-11-18 23:28:26', '2025-11-18 23:28:26'),
(10, 'Said', 'Ali', 'saidsalah37521@gmail.com', '01066536008', '$2y$12$L32hmngXCZ0Xf6/Cje8wlepFHg3V4l4hEQBCf1Ztylnrh4kErk/G.', NULL, 'local', 'customer', NULL, NULL, 1, 'en', NULL, '2025-11-22 23:27:24', '2025-11-22 23:27:24'),
(11, 'Said', 'Ali', 'saidsalah374@gmail.com', '+201066536008', '$2y$12$3ONrWCLqO666uTg44DTYYulzvLLY4km1Ujq6Q3.4FEWaLpjDj85wi', NULL, 'local', 'customer', NULL, NULL, 1, 'en', NULL, '2026-03-12 20:40:17', '2026-03-12 20:40:17');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_payment_stats`
-- (See below for the actual view)
--
CREATE TABLE `vw_payment_stats` (
`transaction_date` date
,`total_transactions` bigint(21)
,`successful` decimal(22,0)
,`failed` decimal(22,0)
,`pending` decimal(22,0)
,`total_amount` decimal(32,2)
,`success_rate` decimal(28,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_payment_summary`
-- (See below for the actual view)
--
CREATE TABLE `vw_payment_summary` (
`id` int(10) unsigned
,`order_number` varchar(50)
,`user_id` int(10) unsigned
,`amount` decimal(10,2)
,`currency` varchar(3)
,`payment_status` enum('pending','success','failed','cancelled','refunded')
,`order_status` enum('pending','processing','shipped','delivered','cancelled','refunded')
,`transaction_id` varchar(255)
,`ip_address` varchar(45)
,`created_at` timestamp
,`processing_time` time /* mariadb-5.3 */
);

-- --------------------------------------------------------

--
-- Structure for view `vw_payment_stats`
--
DROP TABLE IF EXISTS `vw_payment_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_payment_stats`  AS SELECT cast(`payment_transactions`.`created_at` as date) AS `transaction_date`, count(0) AS `total_transactions`, sum(case when `payment_transactions`.`status` = 'success' then 1 else 0 end) AS `successful`, sum(case when `payment_transactions`.`status` = 'failed' then 1 else 0 end) AS `failed`, sum(case when `payment_transactions`.`status` = 'pending' then 1 else 0 end) AS `pending`, sum(case when `payment_transactions`.`status` = 'success' then `payment_transactions`.`amount` else 0 end) AS `total_amount`, round(sum(case when `payment_transactions`.`status` = 'success' then 1 else 0 end) / count(0) * 100,2) AS `success_rate` FROM `payment_transactions` GROUP BY cast(`payment_transactions`.`created_at` as date) ORDER BY cast(`payment_transactions`.`created_at` as date) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `vw_payment_summary`
--
DROP TABLE IF EXISTS `vw_payment_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_payment_summary`  AS SELECT `pt`.`id` AS `id`, `o`.`order_number` AS `order_number`, `o`.`user_id` AS `user_id`, `pt`.`amount` AS `amount`, `pt`.`currency` AS `currency`, `pt`.`status` AS `payment_status`, `o`.`status` AS `order_status`, `pt`.`transaction_id` AS `transaction_id`, `pt`.`ip_address` AS `ip_address`, `pt`.`created_at` AS `created_at`, timediff(`pt`.`updated_at`,`pt`.`created_at`) AS `processing_time` FROM (`payment_transactions` `pt` left join `orders` `o` on(`pt`.`order_id` = `o`.`id`)) ORDER BY `pt`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_governorate` (`governorate`),
  ADD KEY `fk_addresses_user_id` (`user_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `migration` (`migration`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD UNIQUE KEY `unique_guest_order` (`guest_email`,`is_guest`,`created_at`),
  ADD UNIQUE KEY `view_token` (`view_token`),
  ADD KEY `idx_order_barcode` (`barcode`),
  ADD KEY `idx_is_guest` (`is_guest`),
  ADD KEY `idx_guest_email` (`guest_email`),
  ADD KEY `idx_view_token` (`view_token`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_barcode` (`barcode`);

--
-- Indexes for table `order_returns`
--
ALTER TABLE `order_returns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_item_id` (`order_item_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_color` (`product_id`,`color_variant_id`),
  ADD KEY `idx_product_images_color` (`product_id`,`color_value`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `idx_size_value` (`size_value`),
  ADD KEY `idx_color_value` (`color_value`),
  ADD KEY `idx_combination` (`size_value`,`color_value`),
  ADD KEY `idx_variant_barcode` (`barcode`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shipping_governorates`
--
ALTER TABLE `shipping_governorates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_ar` (`name_ar`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_language` (`preferred_language`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `order_returns`
--
ALTER TABLE `order_returns`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=402;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shipping_governorates`
--
ALTER TABLE `shipping_governorates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_returns`
--
ALTER TABLE `order_returns`
  ADD CONSTRAINT `order_returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_returns_ibfk_2` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_returns_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
