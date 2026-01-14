package main.java.com.teamlms.backend.domain.account.repository;

import main.java.com.teamlms.backend.domain.account.entity.Account; 
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    
    
    boolean existsByLoginId(String loginId);

    Optional<Account> findByLoginId(String loginId);
}