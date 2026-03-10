# Server Stats 계산 로직 (평균 사용 금지)

## 입력
- server slug

## 출력(JSON)
- server { slug, name, memberCount, lastUpdateAt }
- dpiDistribution: [{ dpi, count, ratio }]
- sensitivityBands:
  - bands: low/mid/high + 기준(절대 eDPI)
  - byDpi: [{ dpi, total, low, mid, high }]
- edpiQuantilesTopDpi:
  - dpi (가장 많은 dpi)
  - p25, p50, p75
- gearTop:
  - mouse/keyboard/headset top list

## 계산 규칙
1) 대상자 = server_memberships에 속해 있고 setups가 존재하는 profile
2) eDPI = dpi * general_sens (단위는 기존 봇 계산과 일치)
3) 저/중/고 구간은 config로 관리(기본 low<280, mid<380)
4) TOP DPI = dpiDistribution에서 count가 가장 높은 dpi
5) 분위수는 TOP DPI 그룹의 eDPI를 대상으로 p25/p50/p75
6) 장비 top은 null/empty 제외하고 count 내림차순

## 구현 방식
- MVP: Next.js API에서 Supabase 쿼리로 raw rows 가져와 집계(서버 인원 많지 않을 것을 가정)
- 확장: Supabase SQL view/rpc로 집계 이전

## 성능/안전
- 공개 페이지이므로 rate limit 또는 캐싱(서버별 30~120초) 적용 권장
- 서버 통계는 membership 기반이므로 "봇이 없어도" 동작해야 함