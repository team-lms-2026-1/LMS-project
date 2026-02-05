package com.teamlms.backend.domain.community.repository;

import com.teamlms.backend.domain.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface CommunityAccountRepository extends JpaRepository<Account, Long> {

    @Query(value = "SELECT a.account_id, COALESCE(sp.name, pp.name, ap.name, a.login_id) as name " +
            "FROM account a " +
            "LEFT JOIN student_profile sp ON a.account_id = sp.account_id " +
            "LEFT JOIN professor_profile pp ON a.account_id = pp.account_id " +
            "LEFT JOIN admin_profile ap ON a.account_id = ap.account_id " +
            "WHERE a.account_id IN :accountIds", nativeQuery = true)
    List<Object[]> findRealNamesByAccountIdsNative(@Param("accountIds") List<Long> accountIds);

    default Map<Long, String> findRealNamesMap(List<Long> accountIds) {
        return findRealNamesByAccountIdsNative(accountIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> (String) row[1]));
    }

    default String findRealName(Long accountId) {
        List<Object[]> result = findRealNamesByAccountIdsNative(List.of(accountId));
        if (result.isEmpty())
            return null;
        return (String) result.get(0)[1];
    }
}
