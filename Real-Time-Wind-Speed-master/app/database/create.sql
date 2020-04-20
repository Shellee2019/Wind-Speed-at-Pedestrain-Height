use master;
create database if not exists wind COLLATE utf8_general_ci;

use wind;
drop table if exists stations;
create table stations(
  id int primary key auto_increment,
  stationId varchar(30) not null unique,
  stationName varchar(30) not null,
  x float not null,
  y float not null,
  amsl TINYINT not null,
  type varchar(10) not null,
  a float not null,
  z0 float not null
);

drop table if exists observations;
create table observations(
  id int primary key auto_increment,
  wind float default null,
  time timestamp,
  station_id varchar(30) not null
);

drop table if exists idw;
create table idw (
	id int primary key AUTO_INCREMENT,
	gid int not null,
	u100 float not null,
	grid geometry not null,
	time timestamp,
    SPATIAL INDEX(grid)
);

-- drop table if exists z0;
create table SurfaceRoughness (
	id int primary key AUTO_INCREMENT,
	value float,
	grid geometry not null,
	SPATIAL INDEX(grid)
);

drop table if exists temp;
create table temp (
	id int,
	value float,
	grid text    
);

select count(*) from SurfaceRoughness s;
select * from SurfaceRoughness s;

-- load data 不能與create table同時執行，一次只能執行一個load data。
-- stations
-- LOAD DATA INFILE './stations.csv' INTO TABLE stations FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES (stationId, stationName, x, y, amsl, type, a, z0);
LOAD DATA LOCAL INFILE '/home/yuchun/Study/Projects/www/html/Real-Time-Wind-Speed/app/data/stations.csv' INTO TABLE stations FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES (stationId, stationName, x, y, amsl, type, a, z0);

-- z0
LOAD DATA LOCAL INFILE '/home/yuchun/Study/Projects/www/html/Real-Time-Wind-Speed/app/data/z0_layer.csv' INTO TABLE temp FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n' IGNORE 1 LINES; 

insert into z0(id, value, grid) select id, value, ST_GeomFromText(grid) from temp;

-- drop temp
drop table temp;
