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
-- Table structure for table `wotlk_category`
--

DROP TABLE IF EXISTS `wotlk_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wotlk_category` (
  `id` tinyint(3) unsigned NOT NULL,
  `name` varchar(25) NOT NULL,
  `parent_id` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wotlk_category`
--

LOCK TABLES `wotlk_category` WRITE;
/*!40000 ALTER TABLE `wotlk_category` DISABLE KEYS */;
INSERT INTO `wotlk_category` VALUES (2,'Player vs Player',NULL),(3,'Player vs Enemy',NULL),(4,'Class specific',NULL),(5,'Interface specific',NULL),(6,'Unit Frames',NULL),(7,'Buffs & debuffs',NULL),(8,'Quests & leveling',NULL),(9,'Professions & auctions',NULL),(10,'Miscellaneous',NULL),(11,'Addon packs',NULL),(12,'Actionbars',5),(13,'Audio',5),(14,'Bags & inventory',5),(15,'Chat',5),(16,'Mail',5),(17,'Guild',5),(18,'Minimap',5),(19,'Damage',3),(20,'Tank',3),(21,'Healer',3),(22,'Auctions',9),(23,'Alchemy',9),(24,'Blacksmithing',9),(25,'Enchanting',9),(26,'Engineering',9),(27,'Inscription',9),(28,'Jewelcrafting',9),(29,'Leatherworking',9),(30,'Tailoring',9),(31,'Herbalism',9),(32,'Mining',9),(33,'Skinning',9),(35,'First Aid',9),(36,'Cooking',9),(37,'Fishing',9),(38,'Death Knight',4),(39,'Paladin',4),(40,'Druid',4),(41,'Priest',4),(42,'Warrior',4),(43,'Hunter',4),(44,'Rogue',4),(45,'Mage',4),(46,'Shaman',4),(47,'Warlock',4);
/*!40000 ALTER TABLE `wotlk_category` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-08-21 20:24:06
