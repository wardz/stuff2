-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: Database: addons
-- ------------------------------------------------------
-- Server version	5.6.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vanilla_addon`
--

DROP TABLE IF EXISTS `vanilla_addon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vanilla_addon` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `author` varchar(25) DEFAULT 'unknown',
  `description` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` tinyint(3) unsigned NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `is_public` tinyint(1) unsigned DEFAULT '0',
  `total_downloads` int(11) unsigned DEFAULT '0',
  `origin_link` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vanilla_addon`
--

LOCK TABLES `vanilla_addon` WRITE;
/*!40000 ALTER TABLE `vanilla_addon` DISABLE KEYS */;
INSERT INTO `vanilla_addon` VALUES (1,'Questie','AeroScripts, Dyaxler','A quest helper for World of Warcraft (1.12.1) - Vanilla.<br>See origin link for more detailed description.','vanilla/img/questie-01-min.jpg','2016-07-14 17:14:34',8,1,1,0,'https://github.com/AeroScripts/QuestieDev'),(2,'Quest Level','Elkano','This small addon adds the quest\'s level in front of it\'s name. Nothing more, nothing less. ','','2016-07-14 17:14:34',8,1,1,0,NULL),(3,'test','wardz','updated description','vanilla/img/questie-01-min.jpg','2016-07-14 17:14:35',8,1,NULL,0,NULL),(4,'test2','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:14:34',8,1,1,0,NULL),(5,'test3','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:16:57',8,1,1,0,NULL),(6,'test4','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:16:57',8,1,1,0,NULL),(7,'test5','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:16:57',8,1,1,0,NULL),(8,'test6','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:16:57',8,1,1,0,NULL),(9,'test7','wardz','description','vanilla/img/questie-01-min.jpg','2016-07-14 17:16:58',8,1,1,0,NULL),(10,'test8','wardz','desc','vanilla/img/questie-01-min.jpg','2016-07-14 17:17:49',8,1,1,0,NULL);
/*!40000 ALTER TABLE `vanilla_addon` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-08-21 20:24:01
