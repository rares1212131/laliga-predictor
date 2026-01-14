package org.example.predeictorbackend.config;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.entity.AuthProvider;
import org.example.predeictorbackend.entity.Role;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.RoleRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@org.springframework.core.annotation.Order(1)
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        //1.Initialize Roles
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        createDummyFans();

        //2.Initialize Master Admin
        String adminEmail = "admin@laliga.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .firstName("Master")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .provider(AuthProvider.LOCAL)
                    .verified(true)
                    .roles(Set.of(userRole, adminRole))
                    .build();

            userRepository.save(admin);
            System.out.println("🚀 Master Admin created: " + adminEmail + " / admin123");
        }
    }

    private void createDummyFans() {
        if (userRepository.count() > 10) return;

        for (int i = 1; i <= 50; i++) {
            User fan = User.builder()
                    .firstName("Fan")
                    .lastName(String.valueOf(i))
                    .email("fan" + i + "@example.com")
                    .password(passwordEncoder.encode("password"))
                    .provider(AuthProvider.LOCAL)
                    .verified(true)
                    .roles(Set.of(roleRepository.findByName("ROLE_USER").get()))
                    .build();
            userRepository.save(fan);
        }
        System.out.println("👥 50 Dummy Fans created for simulation.");
    }
}