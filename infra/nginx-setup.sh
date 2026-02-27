#!/bin/bash
# ============================================================
# LMS 프로젝트 - Nginx + Let's Encrypt SSL 초기 설정 스크립트
# EC2 서버에 SSH 접속 후 딱 한 번만 실행하면 됩니다.
#
# 사용법: bash nginx-setup.sh
# 대상 OS: Amazon Linux 2023
# 도메인: teamlms.duckdns.org
# ============================================================

set -e  # 오류 발생 시 즉시 중단

DOMAIN="teamlms.duckdns.org"
EMAIL="admin@teamlms.com"  # Let's Encrypt 인증서 만료 알림용 (아무 이메일 가능)

echo "=============================="
echo "  [1/5] Nginx 설치 중..."
echo "=============================="
sudo dnf install -y nginx

sudo systemctl start nginx
sudo systemctl enable nginx
echo "✅ Nginx 설치 및 시작 완료"


echo "=============================="
echo "  [2/5] Nginx 설정 파일 작성..."
echo "=============================="

# 기본 conf 파일 비활성화 (포트 80 충돌 방지)
sudo rm -f /etc/nginx/conf.d/default.conf

# LMS 전용 Nginx 설정 작성
sudo tee /etc/nginx/conf.d/lms.conf > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 80M;

    # Certbot 인증용 경로 (SSL 발급 시 필요)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # 나머지 모든 요청은 Next.js로 프록시
    location / {
        proxy_pass          http://localhost:3000;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade \$http_upgrade;
        proxy_set_header    Connection 'upgrade';
        proxy_set_header    Host \$host;
        proxy_set_header    X-Real-IP \$remote_addr;
        proxy_set_header    X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto \$scheme;
        proxy_cache_bypass  \$http_upgrade;
        proxy_read_timeout  60s;
    }
}
EOF

# Certbot 인증용 디렉토리 생성
sudo mkdir -p /var/www/html

# 설정 파일 문법 검사
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Nginx 설정 완료"


echo "=============================="
echo "  [3/5] Certbot (Let's Encrypt) 설치 중..."
echo "=============================="
sudo dnf install -y python3-pip augeas-libs
sudo pip3 install certbot certbot-nginx --quiet
echo "✅ Certbot 설치 완료"


echo "=============================="
echo "  [4/5] SSL 인증서 발급 중..."
echo "    ⏳ 시간이 조금 걸릴 수 있어요"
echo "=============================="
sudo /usr/local/bin/certbot --nginx \
    -d ${DOMAIN} \
    --non-interactive \
    --agree-tos \
    -m ${EMAIL}
echo "✅ SSL 인증서 발급 완료! (90일 유효)"


echo "=============================="
echo "  [5/5] 자동 갱신 크론탭 등록..."
echo "=============================="
# 매일 오전 3시에 인증서 갱신 시도 (만료 30일 전부터 자동 갱신)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/certbot renew --quiet && sudo systemctl reload nginx") | crontab -
echo "✅ 자동 갱신 등록 완료 (매일 오전 3시 체크)"


echo ""
echo "=============================="
echo "  🎉 설정 완료!"
echo "=============================="
echo ""
echo "  접속 주소: https://${DOMAIN}"
echo ""
echo "  [확인 명령어]"
echo "  sudo systemctl status nginx"
echo "  sudo certbot certificates"
echo "  curl -I https://${DOMAIN}"
echo ""
