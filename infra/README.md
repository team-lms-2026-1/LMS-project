앞으로 infra 가 해야 할 일
목표 : merge  > github action 실행 > actions가 ec2에 새버전을 배포 > flyway가 rds에 연결해서 마이그레이션

RDS 생성(postgres)

EC2 생성

SG 설정 (RDS는 EC2 SG만 허용)

스프링부트에 Flyway 추가

EC2에 배포 파이프라인 구축

배포 시 Flyway로 RDS 스키마 자동 반영