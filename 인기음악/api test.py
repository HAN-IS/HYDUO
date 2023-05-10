import google.auth
from googleapiclient.discovery import build

# 유튜브 API 인증 정보
api_key = "AIzaSyB1WN1jdwOXiZmLoyUjbJgVK7coF8ULlVo"

# 유튜브 API 클라이언트 생성
youtube = build('youtube', 'v3', developerKey=api_key)

# 인기 음악 동영상 정보 가져오기
popular_music_response = youtube.videos().list(
    part='snippet,statistics',
    chart='mostPopular',
    regionCode='KR',
    videoCategoryId=10, # 10번 카테고리는 음악 카테고리입니다.
    maxResults=10
).execute()

for item in popular_music_response['items']:
    title = item['snippet']['title']
    views = item['statistics']['viewCount']
    likes = item['statistics'].get('likeCount', 0)
    print('Title:', title)
    print('Views:', views)
    print('Likes:', likes)
    print('Video ID:', item['id'].split('/')[-1])
    print('----------------------------------')
