앞으로 infra 가 해야 할 일
목표 : merge  > github action 실행 > actions가 ec2에 새버전을 배포 > flyway가 rds에 연결해서 마이그레이션

RDS 생성(postgres)

EC2 생성

SG 설정 (RDS는 EC2 SG만 허용)

스프링부트에 Flyway 추가

EC2에 배포 파이프라인 구축

배포 시 Flyway로 RDS 스키마 자동 반영

//내 컴퓨터(로컬)로 서버 실행해서 잘되는지 확인할 때(docker로 키는법)
 docker compose -f docker-compose.local.yml up --build 
http://localhost:8080/ 로 접속

//PR후 EC2 서버에 잘 올라갔는지 확인 할때
http://43.201.157.8:8080/ 로 접속