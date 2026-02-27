package com.teamlms.backend.domain.account.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.teamlms.backend.domain.account.api.dto.AdminAccountCreateRequest;
import com.teamlms.backend.domain.account.api.dto.AdminAccountUpdateRequest;
import com.teamlms.backend.domain.account.entity.Account;
import com.teamlms.backend.domain.account.entity.AdminProfile;
import com.teamlms.backend.domain.account.entity.ProfessorProfile;
import com.teamlms.backend.domain.account.entity.StudentProfile;
import com.teamlms.backend.domain.account.enums.AcademicStatus;
import com.teamlms.backend.domain.account.enums.AccountStatus;
import com.teamlms.backend.domain.account.enums.AccountType;
import com.teamlms.backend.domain.account.repository.AccountRepository;
import com.teamlms.backend.domain.account.repository.AdminProfileRepository;
import com.teamlms.backend.domain.account.repository.ProfessorProfileRepository;
import com.teamlms.backend.domain.account.repository.StudentProfileRepository;
import com.teamlms.backend.domain.authorization.service.DefaultRoleAssignerService;
import com.teamlms.backend.domain.dept.entity.Major;
import com.teamlms.backend.domain.dept.entity.StudentMajor;
import com.teamlms.backend.domain.dept.enums.MajorType;
import com.teamlms.backend.domain.dept.repository.DeptRepository;
import com.teamlms.backend.domain.dept.repository.MajorRepository;
import com.teamlms.backend.domain.dept.repository.StudentMajorRepository;
import com.teamlms.backend.global.exception.base.BusinessException;

@ExtendWith(MockitoExtension.class)
class AccountCommandServiceTest {

    @InjectMocks
    private AccountCommandService accountCommandService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private ProfessorProfileRepository professorProfileRepository;

    @Mock
    private AdminProfileRepository adminProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private DefaultRoleAssignerService defaultRoleAssignerService;

    @Mock
    private DeptRepository deptRepository;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private StudentMajorRepository studentMajorRepository;

    @Test
    @DisplayName("관리자 생성 성공 - 학생 (Student)")
    void adminCreate_Success_Student() {
        // given
        AdminAccountCreateRequest req = new AdminAccountCreateRequest();
        ReflectionTestUtils.setField(req, "loginId", "202300001");
        ReflectionTestUtils.setField(req, "password", "Password123!");
        ReflectionTestUtils.setField(req, "accountType", AccountType.STUDENT);
        ReflectionTestUtils.setField(req, "status", AccountStatus.ACTIVE);

        AdminAccountCreateRequest.Profile profile = new AdminAccountCreateRequest.Profile();
        ReflectionTestUtils.setField(profile, "name", "학생일");
        ReflectionTestUtils.setField(profile, "deptId", 10L);
        ReflectionTestUtils.setField(profile, "studentNo", "202300001");
        ReflectionTestUtils.setField(profile, "gradeLevel", 1);
        ReflectionTestUtils.setField(profile, "academicStatus", AcademicStatus.ENROLLED);

        AdminAccountCreateRequest.MajorMapping majorMapping = new AdminAccountCreateRequest.MajorMapping();
        ReflectionTestUtils.setField(majorMapping, "majorId", 100L);
        ReflectionTestUtils.setField(majorMapping, "majorType", MajorType.PRIMARY);
        ReflectionTestUtils.setField(profile, "majors", List.of(majorMapping));

        ReflectionTestUtils.setField(req, "profile", profile);

        when(accountRepository.existsByLoginId(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");

        Account savedAccount = Account.builder().accountType(AccountType.STUDENT).build();
        ReflectionTestUtils.setField(savedAccount, "accountId", 1L);
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        when(deptRepository.existsById(anyLong())).thenReturn(true);

        Major major = Major.builder().deptId(10L).build();
        ReflectionTestUtils.setField(major, "majorId", 100L);
        when(majorRepository.findById(100L)).thenReturn(Optional.of(major));

        // when
        Long accountId = accountCommandService.adminCreate(req, 999L);

        // then
        assertNotNull(accountId);
        assertEquals(1L, accountId);
        verify(studentProfileRepository).save(any(StudentProfile.class));
        verify(studentMajorRepository).save(any(StudentMajor.class));
        verify(defaultRoleAssignerService).assignDefaultRole(1L, AccountType.STUDENT, 999L);
    }

    @Test
    @DisplayName("관리자 생성 성공 - 교수 (Professor)")
    void adminCreate_Success_Professor() {
        // given
        AdminAccountCreateRequest req = new AdminAccountCreateRequest();
        ReflectionTestUtils.setField(req, "loginId", "P00000001");
        ReflectionTestUtils.setField(req, "password", "Password123!");
        ReflectionTestUtils.setField(req, "accountType", AccountType.PROFESSOR);
        ReflectionTestUtils.setField(req, "status", AccountStatus.ACTIVE);

        AdminAccountCreateRequest.Profile profile = new AdminAccountCreateRequest.Profile();
        ReflectionTestUtils.setField(profile, "name", "교수일");
        ReflectionTestUtils.setField(profile, "deptId", 10L);
        ReflectionTestUtils.setField(profile, "professorNo", "P001");

        ReflectionTestUtils.setField(req, "profile", profile);

        when(accountRepository.existsByLoginId(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");

        Account savedAccount = Account.builder().accountType(AccountType.PROFESSOR).build();
        ReflectionTestUtils.setField(savedAccount, "accountId", 2L);
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        when(deptRepository.existsById(anyLong())).thenReturn(true);

        // when
        Long accountId = accountCommandService.adminCreate(req, 999L);

        // then
        assertNotNull(accountId);
        assertEquals(2L, accountId);
        verify(professorProfileRepository).save(any(ProfessorProfile.class));
        verify(defaultRoleAssignerService).assignDefaultRole(2L, AccountType.PROFESSOR, 999L);
    }

    @Test
    @DisplayName("관리자 생성 성공 - 관리자 (Admin)")
    void adminCreate_Success_Admin() {
        // given
        AdminAccountCreateRequest req = new AdminAccountCreateRequest();
        ReflectionTestUtils.setField(req, "loginId", "admin_001");
        ReflectionTestUtils.setField(req, "password", "Password123!");
        ReflectionTestUtils.setField(req, "accountType", AccountType.ADMIN);
        ReflectionTestUtils.setField(req, "status", AccountStatus.ACTIVE);

        AdminAccountCreateRequest.Profile profile = new AdminAccountCreateRequest.Profile();
        ReflectionTestUtils.setField(profile, "name", "관리자일");

        ReflectionTestUtils.setField(req, "profile", profile);

        when(accountRepository.existsByLoginId(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");

        Account savedAccount = Account.builder().accountType(AccountType.ADMIN).build();
        ReflectionTestUtils.setField(savedAccount, "accountId", 3L);
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        // when
        Long accountId = accountCommandService.adminCreate(req, 999L);

        // then
        assertNotNull(accountId);
        assertEquals(3L, accountId);
        verify(adminProfileRepository).save(any(AdminProfile.class));
        verify(defaultRoleAssignerService).assignDefaultRole(3L, AccountType.ADMIN, 999L);
    }

    @Test
    @DisplayName("계정 생성 실패 - 중복된 로그인 ID")
    void adminCreate_Fail_DuplicateLoginId() {
        // given
        AdminAccountCreateRequest req = new AdminAccountCreateRequest();
        ReflectionTestUtils.setField(req, "loginId", "202300001");

        when(accountRepository.existsByLoginId("202300001")).thenReturn(true);

        // when & then
        assertThrows(BusinessException.class, () -> accountCommandService.adminCreate(req, 999L));
    }

    @Test
    @DisplayName("상태 변경 성공")
    void updateStatus_Success() {
        // given
        Long accountId = 1L;
        Account account = Account.builder().status(AccountStatus.ACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        // when
        Account updatedAccount = accountCommandService.updateStatus(accountId, AccountStatus.INACTIVE, 999L);

        // then
        assertEquals(AccountStatus.INACTIVE, updatedAccount.getStatus());
    }

    @Test
    @DisplayName("계정 수정 성공 - 학생 기본 정보 및 전공/전과")
    void adminUpdate_Success_Student() {
        // given
        Long accountId = 1L;
        Account account = Account.builder().accountType(AccountType.STUDENT).status(AccountStatus.ACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        AdminAccountUpdateRequest req = new AdminAccountUpdateRequest();
        // 학생 프로필 변경 요청 (전과 및 등급 변경)
        ReflectionTestUtils.setField(req, "name", "학생수정");
        ReflectionTestUtils.setField(req, "gradeLevel", 3);
        ReflectionTestUtils.setField(req, "deptId", 20L); // 학과 변경

        AdminAccountUpdateRequest.MajorMapping majorMapping = new AdminAccountUpdateRequest.MajorMapping();
        ReflectionTestUtils.setField(majorMapping, "majorId", 200L); // 전공 변경
        ReflectionTestUtils.setField(majorMapping, "majorType", MajorType.PRIMARY);
        ReflectionTestUtils.setField(req, "majors", List.of(majorMapping));

        StudentProfile sp = StudentProfile.builder().name("학생일").gradeLevel(2).deptId(10L).account(account).build();
        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));

        when(deptRepository.existsById(20L)).thenReturn(true);
        Major major = Major.builder().deptId(20L).build();
        ReflectionTestUtils.setField(major, "majorId", 200L);
        when(majorRepository.findById(200L)).thenReturn(Optional.of(major));

        // when
        accountCommandService.adminUpdate(accountId, req, 999L);

        // then
        assertEquals("학생수정", sp.getName());
        assertEquals(3, sp.getGradeLevel());
        assertEquals(20L, sp.getDeptId());

        verify(studentMajorRepository).deleteAllByStudentAccountId(accountId);
        verify(studentMajorRepository).save(any(StudentMajor.class));
    }

    @Test
    @DisplayName("계정 수정 실패 - 학생 전공/소속학과 누락")
    void adminUpdate_Fail_Student_MissingMajors() {
        // given
        Long accountId = 1L;
        Account account = Account.builder().accountType(AccountType.STUDENT).status(AccountStatus.ACTIVE).build();
        ReflectionTestUtils.setField(account, "accountId", accountId);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        AdminAccountUpdateRequest req = new AdminAccountUpdateRequest();
        ReflectionTestUtils.setField(req, "deptId", 20L); // deptId 만 있고 majors 가 없음

        StudentProfile sp = StudentProfile.builder().name("학생일").gradeLevel(2).deptId(10L).account(account).build();
        when(studentProfileRepository.findById(accountId)).thenReturn(Optional.of(sp));

        // when & then
        assertThrows(IllegalArgumentException.class, () -> accountCommandService.adminUpdate(accountId, req, 999L));
    }
}
