package org.example.predeictorbackend.service;

import lombok.RequiredArgsConstructor;
import org.example.predeictorbackend.dto.response.AdminUserResponse;
import org.example.predeictorbackend.entity.Role;
import org.example.predeictorbackend.entity.User;
import org.example.predeictorbackend.repository.RoleRepository;
import org.example.predeictorbackend.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    AdminUserResponse res = modelMapper.map(user, AdminUserResponse.class);
                    res.setRoles(user.getRoles().stream().map(Role::getName).toList());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateUserRoles(Long userId, List<String> roleNames) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Set<Role> roles = roleNames.stream()
                .map(name -> roleRepository.findByName(name).orElseThrow(() -> new RuntimeException("Role " + name + " not found")))
                .collect(Collectors.toSet());
        user.setRoles(roles);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}