package com.althaus.dev.chatbackend.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Punto de entrada principal para la aplicación de chat basada en Spring Boot.
 * Configura automáticamente los componentes de Spring y habilita la detección de repositorios de MongoDB.
 */
@SpringBootApplication(scanBasePackages = "com.althaus.dev.chatbackend")
@EnableMongoRepositories(basePackages = "com.althaus.dev.chatbackend.domain.repository")
public class BackendChatApplication {

	/**
	 * Método principal que inicia la aplicación de Spring Boot.
	 *
	 * @param args Argumentos de línea de comandos (opcionales).
	 */
	public static void main(String[] args) {
		SpringApplication.run(BackendChatApplication.class, args);
	}
}
