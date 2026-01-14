package org.example.predeictorbackend.security.oauth2;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.entity.AuthProvider;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.RoleRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class OAuth2UserProvisioningService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public User provisionUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .firstName(oAuth2User.getAttribute("given_name"))
                    .lastName(oAuth2User.getAttribute("family_name"))
                    .provider(AuthProvider.GOOGLE)
                    .verified(true)
                    .roles(Set.of(roleRepository.findByName("ROLE_USER").orElseThrow()))
                    .build();
            return userRepository.save(newUser);
        });
    }
}