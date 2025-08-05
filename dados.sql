create database api;
use api;

create table usuario(
id int auto_increment,
email varchar(500),
senha varchar(500),
nome varchar(500),
primary key(id)
);

create table gostos (
id int auto_increment,
nome varchar(500),
primary key(id, nome)
);

create table gostosUsuario (
id int auto_increment,
idUsuario int,
nomeGosto int,
constraint fkUsuario foreign key (idUsuario) references usuario(id),
constraint fkNomeGosto foreign key (nomeGosto) references gostos(id),
primary key (id)
);

create table mensagens(
id int auto_increment,
mensagem longtext,
idRemetente int,
idDestinatario int,
constraint fkIdRemetente foreign key(idRemetente)references usuario(id),
constraint fkIdDestinatario foreign key(idDestinatario)references usuario(id),
primary key (id)
);
