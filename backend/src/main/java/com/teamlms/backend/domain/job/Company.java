package com.teamlms.backend.domain.job;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @Column(name = "biz_no", length = 20)
    private String bizNo; // 사업자등록번호 (PK)

    @Column(nullable = false)
    private String companyName;

    private String ceoName;
    private String companyType; // 강소기업 등
    private String industryCode;

    @Column(columnDefinition = "TEXT")
    private String mainBusiness;

    private String address;
    private String website;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}