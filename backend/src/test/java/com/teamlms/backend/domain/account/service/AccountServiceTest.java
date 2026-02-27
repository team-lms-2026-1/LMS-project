package com.teamlms.backend.domain.account.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.api.dto.AdminAccountListItem;
import com.teamlms.backend.domain.account.api.dto.AdminStudentDetailResponse;
import com.teamlms.backend.domain.account.api.dto.MyProfileResponse;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.AdminProfileRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.dept.entity.Dept;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @InjectMocks
    private AccountService accountService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private ProfessorProfileRepository professorProfileRepository;

    @Mock
    private AdminProfileRepository adminProfileRepository;

    @Mock
    private DeptRepository deptRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("로그인 인증 성공 (Authenticate)")
    void authenticate_Success() {
        // given
        String loginId = "user1";
        String rawPassword = "password123";

        Account account = Account.builder().loginId(loginId).passwordHash("hashed").status(AccountStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(account, "accountId", 1L);

        when(accountRepository.findByLoginId(loginId)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches(rawPassword, "hashed")).thenReturn(true);

        // when
        Account authenticated = accountService.authenticate(loginId, rawPassword);

        // then
        assertNotNull(authenticated);
        assertEquals(loginId, authenticated.getLoginId());
    }

    @Test
    @DisplayName("로그인 인증 실패 - 상태 확인 (Inactive)")
    void authenticate_Fail_Inactive() {
        // given
        String loginId = "user1";
        String rawPassword = "password123";

        Account account = Account.builder().loginId(loginId).passwordHash("hashed").status(AccountStatus.INACTIVE)
                .build();
        ReflectionTestUtils.setField(account, "accountId", 1L);

        when(accountRepository.findByLoginId(loginId)).thenReturn(Optional.of(account));

        // when & then
        assertThrows(BusinessException.class, () -> accountService.authenticate(loginId, rawPassword));
    }

    @Test
    @DisplayName("로그인 인증 실패 - 비밀번호 불일치")
    void authenticate_Fail_WrongPassword() {
        // given
        String loginId = "user1";
        String rawPassword = "wrongPassword";

        Account account = Account.builder().loginId(loginId).passwordHash("hashed").status(AccountStatus.ACTIVE)
                .build();
        ReflectionTestUtils.setField(account, "accountId", 1L);

        when(accountRepository.findByLoginId(loginId)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches(rawPassword, "hashed")).thenReturn(false);

        // when & then
        assertThrows(BusinessException.class, () -> accountService.authenticate(loginId, rawPassword));
    }

    @Test
    @DisplayName("관리자 계정 목록 조회")
    void adminList_Success() {
        // given
        Pageable pageable = PageRequest.of(0, 10);
        AdminAccountListItem mockItem = new AdminAccountListItem(1L, "test", "학생1", "email@test.com",
                AccountType.STUDENT, AccountStatus.ACTIVE, LocalDateTime.now());

        Page<AdminAccountListItem> mockPage = new PageImpl<>(List.of(mockItem));
        when(accountRepository.searchAccounts(any(), any(), any(), any())).thenReturn(mockPage);

        // when
        Page<AdminAccountListItem> result = accountService.adminList(null, AccountType.STUDENT, null, pageable);

        // then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("학생1", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("관리자 학생 계정 상세 조회")
    void adminDetail_Student_Success() {
        // given
        Long accountId = 1L;
        when(accountRepository.findAccountTypeById(accountId)).thenReturn(AccountType.STUDENT);

        AdminStudentDetailResponse mockBase = AdminStudentDetailResponse.builder()
                .accountId(accountId)
                .accountType(AccountType.STUDENT)
                .profile(AdminStudentDetailResponse.Profile.builder().name("학생1").build())
                .build();
        when(accountRepository.findStudentBaseDetail(accountId)).thenReturn(mockBase);

        AdminStudentDetailResponse.DeptSimple deptNode = AdminStudentDetailResponse.DeptSimple.builder().deptId(10L)
                .deptName("테스트 학과").build();
        AdminStudentDetailResponse.MajorItem major1 = AdminStudentDetailResponse.MajorItem.builder().majorId(100L)
                .majorName("전공1").majorType(MajorType.PRIMARY).dept(deptNode).build();
        when(accountRepository.findStudentMajors(accountId)).thenReturn(List.of(major1));

        // when
        Object detail = accountService.adminDetail(accountId);

        // then
        assertNotNull(detail);
        assertTrue(detail instanceof AdminStudentDetailResponse);
        AdminStudentDetailResponse studentDetail = (AdminStudentDetailResponse) detail;
        assertEquals("학생1", studentDetail.getProfile().getName());
        assertEquals(10L, studentDetail.getProfile().getDept().getDeptId());
        assertEquals(100L, studentDetail.getProfile().getPrimaryMajor().getMajorId());
    }

    @Test
    @DisplayName("내 정보(My Profile) 조회 성공 - 학생")
    void getMyProfile_Student_Success() {
        // given
        Long accountId = 1L;
        when(accountRepository.findAccountTypeById(accountId)).thenReturn(AccountType.STUDENT);

        StudentProfile sp = StudentProfile.builder().name("내이름").gradeLevel(3).deptId(10L).build();
        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));

        Dept dept = Dept.builder().deptName("컴공").build();
        when(deptRepository.findById(10L)).thenReturn(Optional.of(dept));

        // when
        MyProfileResponse profile = accountService.getMyProfile(accountId);

        // then
        assertEquals(accountId, profile.getAccountId());
        assertEquals("내이름", profile.getName());
        assertEquals(3, profile.getGradeLevel());
        assertEquals("컴공", profile.getDeptName());
    }
}
