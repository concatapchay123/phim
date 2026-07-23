---
title: "Hướng dẫn đầy đủ API KKPhim / PhimAPI"
source_documentation: "https://kkphim2.com/api-document"
api_base_url: "https://phimapi.com"
last_reviewed: "2026-07-23"
language: "vi"
---

# Hướng dẫn đầy đủ API KKPhim / PhimAPI

> Tài liệu thực hành để đọc, thử nghiệm và tích hợp API được giới thiệu trên trang tài liệu KKPhim.
>
> **Base URL:** `https://phimapi.com`
>
> **Nguồn tài liệu:** `https://kkphim2.com/api-document`

## 1. Điều cần biết trước khi dùng

API được mô tả là RESTful, trả dữ liệu JSON mã hóa UTF-8 và các endpoint trong tài liệu đều sử dụng phương thức `GET`. Các ví dụ công khai gọi API trực tiếp, không có API key, OAuth hoặc cơ chế đăng nhập nào được tài liệu nêu ra.

Tuy nhiên, không nên hiểu điều đó là API có cam kết miễn phí vĩnh viễn, không giới hạn hoặc có SLA. Tài liệu không công bố rate limit, điều khoản ổn định phiên bản hay thời gian duy trì endpoint. Khi dùng trong sản phẩm thật, hãy thêm cache, timeout, retry có kiểm soát và xử lý trường hợp cấu trúc phản hồi thay đổi.

Ngoài ra, quyền truy cập dữ liệu hoặc đường dẫn video **không đồng nghĩa** với quyền phân phối lại nội dung. Footer của trang KKPhim cũng nêu rằng video và dữ liệu được tổng hợp từ Internet và trang không cung cấp dịch vụ phát trực tuyến chính thức. Hãy tự kiểm tra quyền sử dụng, bản quyền và quy định tại nơi ứng dụng của bạn hoạt động.

## 2. Bắt đầu nhanh

### cURL

```bash
curl --request GET \
  --url 'https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1' \
  --header 'accept: application/json'
```

### JavaScript trên trình duyệt

```js
const response = await fetch(
  'https://phimapi.com/v1/api/tim-kiem?keyword=avengers&limit=10',
  { headers: { accept: 'application/json' } },
);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const payload = await response.json();
console.log(payload);
```

### Python

```python
import requests

response = requests.get(
    "https://phimapi.com/v1/api/tim-kiem",
    params={"keyword": "avengers", "limit": 10},
    headers={"accept": "application/json"},
    timeout=15,
)
response.raise_for_status()
print(response.json())
```

## 3. Quy ước chung

| Thuộc tính | Giá trị / ghi chú |
|---|---|
| Base URL | `https://phimapi.com` |
| Phương thức | `GET` |
| Định dạng | JSON |
| Mã hóa | UTF-8 |
| Header khuyên dùng | `Accept: application/json` |
| Xác thực | Tài liệu không nêu API key hoặc OAuth |
| Tham số đường dẫn | Dùng cho `slug`, `_id`, TMDB ID, IMDb ID, năm… |
| Tham số truy vấn | Dùng cho phân trang, lọc và sắp xếp |

Luôn URL-encode giá trị tìm kiếm. Với `URLSearchParams`, việc này được thực hiện tự động:

```js
const params = new URLSearchParams({
  keyword: 'cảnh sát vũ trụ',
  page: '1',
});

const url = `https://phimapi.com/v1/api/tim-kiem?${params}`;
```

## 4. Bộ lọc và sắp xếp dùng chung

Tài liệu áp dụng nhóm tham số sau cho các endpoint danh sách v1, thể loại, quốc gia, năm và tìm kiếm.

| Tham số | Kiểu | Bắt buộc | Ý nghĩa |
|---|---:|:---:|---|
| `page` | integer | Không | Trang hiện tại, thường mặc định là `1`. |
| `limit` | integer | Không | Số phim mỗi trang. Tài liệu ghi mặc định `10`, tối đa `64`, và nhấn mạnh áp dụng ở tìm kiếm. Một số response danh sách mẫu vẫn dùng 24 phần tử/trang, vì vậy không nên giả định mọi endpoint đều tôn trọng `limit`. |
| `category` | slug | Không | Lọc theo thể loại, ví dụ `hanh-dong`. |
| `country` | slug | Không | Lọc theo quốc gia, ví dụ `han-quoc`. |
| `year` | number/string | Không | Năm phát hành, ví dụ `2024`; tài liệu cũng cho phép dải dạng `2014,2024`. |
| `sort_field` | string | Không | `modified.time`, `_id` hoặc `year`; mặc định `modified.time`. |
| `sort_type` | string | Không | `desc` hoặc `asc`; mặc định `desc`. |
| `sort_lang` | string | Không | `vietsub`, `thuyet-minh` hoặc `long-tieng`. |

Ví dụ kết hợp bộ lọc:

```text
https://phimapi.com/v1/api/danh-sach/phim-le?country=han-quoc&year=2024&sort_field=year&sort_type=desc&page=1
```

## 5. Danh mục endpoint

| Nhóm | Endpoint | Công dụng | Dạng phản hồi chính |
|---|---|---|---|
| Phim mới | `GET /danh-sach/phim-moi-cap-nhat` | Phim mới cập nhật, định dạng cổ điển | `items` + `pathImage` + `pagination` |
| Phim mới | `GET /danh-sach/phim-moi-cap-nhat-v2` | Biến thể chi tiết hơn của danh sách cũ | Cổ điển, bổ sung trường |
| Phim mới | `GET /danh-sach/phim-moi-cap-nhat-v3` | Biến thể chi tiết hơn, có thêm dữ liệu IMDb/TMDB | Cổ điển, bổ sung trường |
| Trang chủ | `GET /v1/api/home` | Dữ liệu phim hiển thị ở trang chủ / cập nhật trong ngày | Dạng danh sách |
| Phim mới v1 | `GET /v1/api/danh-sach` | Danh sách “Phim Mới” v1, hỗ trợ bộ lọc | `data.items` + `data.params` |
| Danh sách cũ | `GET /danh-sach/{type}` | Lấy phim theo loại | `items` + `pagination` |
| Danh sách v1 | `GET /v1/api/danh-sach/{type}` | Lấy phim theo loại, bộ lọc đầy đủ | `data.items` + `data.params` |
| Chi tiết cũ | `GET /phim/{slug}` | Chi tiết phim và tập theo slug | `movie` + `episodes` |
| Chi tiết theo ID | `GET /phim/id/{id}` | Chi tiết theo `_id` | `movie` + `episodes` |
| Chi tiết theo TMDB | `GET /tmdb/{type}/{id}` | Chi tiết theo TMDB ID | `movie` + `episodes` |
| Chi tiết theo IMDb | `GET /imdb/title/{id}` | Chi tiết theo IMDb ID | `movie` + `episodes` |
| Chi tiết v1 | `GET /v1/api/phim/{slug}` | Chi tiết v1, tập nằm trong `data.item` | `data.item` |
| Ảnh | `GET /v1/api/phim/{slug}/images` | Poster, backdrop và kích thước ảnh TMDB | `data.images` |
| Diễn viên | `GET /v1/api/phim/{slug}/peoples` | Diễn viên, đạo diễn, ê-kíp | `data.peoples` |
| Từ khóa | `GET /v1/api/phim/{slug}/keywords` | Keyword của phim | `data.keywords` |
| Thể loại | `GET /the-loai` | Danh sách thể loại | Có thể là mảng trực tiếp |
| Thể loại v1 | `GET /v1/api/the-loai` | Danh sách thể loại dạng v1 | Danh sách thể loại |
| Theo thể loại | `GET /v1/api/the-loai/{slug}` | Phim thuộc một thể loại | `data.items` + bộ lọc |
| Quốc gia | `GET /quoc-gia` | Danh sách quốc gia | Danh sách quốc gia |
| Quốc gia v1 | `GET /v1/api/quoc-gia` | Danh sách quốc gia dạng v1 | Danh sách quốc gia |
| Theo quốc gia | `GET /v1/api/quoc-gia/{slug}` | Phim thuộc một quốc gia | `data.items` + bộ lọc |
| Năm | `GET /nam-phat-hanh` | Danh sách năm từ hiện tại về 1911 | Danh sách năm |
| Theo năm | `GET /v1/api/nam/{year}` | Phim phát hành trong năm | `data.items` + bộ lọc |
| Tìm kiếm | `GET /v1/api/tim-kiem` | Tìm theo tên Việt hoặc tên gốc | `data.items` + bộ lọc |

## 6. Phim mới và dữ liệu trang chủ

### 6.1. Phim mới cập nhật — định dạng cổ điển

```http
GET /danh-sach/phim-moi-cap-nhat?page=1
```

Tham số:

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---:|:---:|---|
| `page` | integer | Không | Trang hiện tại, mặc định `1`. |

Phản hồi điển hình:

```json
{
  "status": true,
  "items": [
    {
      "_id": "...",
      "name": "...",
      "slug": "...",
      "origin_name": "...",
      "thumb_url": "...",
      "poster_url": "...",
      "year": 2024,
      "modified": { "time": "..." }
    }
  ],
  "pathImage": "https://phimapi.com/uploads/movies/",
  "pagination": {
    "totalItems": 100,
    "totalItemsPerPage": 24,
    "currentPage": 1,
    "totalPages": 5
  }
}
```

Tài liệu nhắc đến hai biến thể:

```text
/danh-sach/phim-moi-cap-nhat-v2
/danh-sach/phim-moi-cap-nhat-v3
```

Hai biến thể này được mô tả là bổ sung trường và dữ liệu ảnh/ID IMDb/TMDB đầy đủ hơn, nhưng trang tài liệu không đưa contract riêng chi tiết cho từng biến thể. Hãy kiểm tra payload thực tế trước khi khai báo kiểu dữ liệu cứng.

### 6.2. Dữ liệu trang chủ

```http
GET /v1/api/home?page=1
```

Mục đích: lấy các phim dùng ở trang chủ, bao gồm phim được cập nhật trong ngày. Tham số được tài liệu nêu là `page`.

### 6.3. Phim mới — định dạng v1

```http
GET /v1/api/danh-sach?page=1
```

Endpoint không cần `{type}` và hỗ trợ bộ lọc chung.

```json
{
  "status": "success",
  "message": "",
  "data": {
    "items": [
      {
        "_id": "...",
        "name": "...",
        "slug": "...",
        "origin_name": "...",
        "type": "single",
        "thumb_url": "...",
        "poster_url": "...",
        "year": 2024,
        "tmdb": {
          "id": "...",
          "type": "movie",
          "season": null,
          "vote_average": 7.2,
          "vote_count": 100
        },
        "imdb": {
          "id": "tt...",
          "vote_average": 0,
          "vote_count": 0
        },
        "category": [],
        "country": [],
        "last_episodes": []
      }
    ],
    "params": {
      "sortField": "modified.time",
      "sortType": "desc",
      "pagination": {
        "totalItems": 100,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "pageRanges": 5
      }
    }
  }
}
```

## 7. Danh sách phim theo loại

### 7.1. Endpoint cũ

```http
GET /danh-sach/{type}?page=1
```

Giá trị `type` được tài liệu cho phép:

- `phim-le`
- `phim-bo`
- `hoat-hinh`
- `tv-shows`
- `phim-chieu-rap`

Ví dụ:

```text
https://phimapi.com/danh-sach/phim-bo?page=1
```

Phản hồi thường có `status`, `msg`, `items` và `pagination` ở cấp gốc.

### 7.2. Endpoint v1 có bộ lọc đầy đủ

```http
GET /v1/api/danh-sach/{type}
```

Giá trị `type` được trang tài liệu liệt kê cho bản v1:

- `phim-le`
- `phim-bo`
- `hoat-hinh`
- `tv-shows`

Ví dụ:

```text
https://phimapi.com/v1/api/danh-sach/phim-le?country=han-quoc&year=2024&page=1
```

Bản v1 bọc danh sách trong `data.items`, kèm `data.params`, thông tin SEO và breadcrumb có thể xuất hiện trong payload đầy đủ.

## 8. Chi tiết phim

### 8.1. Theo slug — định dạng cổ điển

```http
GET /phim/{slug}
```

Ví dụ:

```text
https://phimapi.com/phim/lightyear-canh-sat-vu-tru
```

Phản hồi:

```json
{
  "status": true,
  "msg": "",
  "movie": {
    "_id": "...",
    "name": "...",
    "slug": "...",
    "origin_name": "...",
    "content": "<p>...</p>",
    "type": "hoathinh",
    "status": "completed",
    "thumb_url": "https://...",
    "poster_url": "https://...",
    "trailer_url": "https://...",
    "time": "105 phút",
    "episode_current": "Full",
    "episode_total": 1,
    "quality": "FHD",
    "lang": "Vietsub + Lồng Tiếng",
    "year": 2022,
    "actor": [],
    "director": [],
    "category": [],
    "country": [],
    "tmdb": {},
    "imdb": {}
  },
  "episodes": [
    {
      "server_name": "Vietsub",
      "is_ai": false,
      "server_data": [
        {
          "name": "Full",
          "slug": "full",
          "filename": "...",
          "link_embed": "https://...",
          "link_m3u8": "https://.../index.m3u8"
        }
      ]
    }
  ]
}
```

Trường `content` chứa HTML. Không chèn trực tiếp vào DOM từ dữ liệu chưa được làm sạch. Với React, nên sanitize bằng thư viện phù hợp trước khi dùng `dangerouslySetInnerHTML`.

### 8.2. Theo `_id`

```http
GET /phim/id/{id}
```

Ví dụ:

```text
https://phimapi.com/phim/id/665f0a1b2c3d4e5f
```

Contract tương tự `/phim/{slug}`, nhưng tra cứu bằng `_id`.

### 8.3. Theo TMDB

```http
GET /tmdb/{type}/{id}
```

| Tham số | Giá trị |
|---|---|
| `type` | `movie` hoặc `tv` |
| `id` | ID số của TMDB |

Ví dụ:

```text
https://phimapi.com/tmdb/movie/299534
```

### 8.4. Theo IMDb

```http
GET /imdb/title/{id}
```

Ví dụ:

```text
https://phimapi.com/imdb/title/tt36596650
```

Lưu ý: bảng tham số trên trang tài liệu có dòng `type: movie | tv`, nhưng đường dẫn và ví dụ chỉ chứa IMDb ID. Đây có vẻ là lỗi hoặc phần thừa trong tài liệu; đừng thêm `type` vào path nếu API không yêu cầu.

### 8.5. Chi tiết v1

```http
GET /v1/api/phim/{slug}
```

Khác biệt quan trọng:

- Dữ liệu nằm trong `data.item`.
- `episodes` nằm **bên trong** `data.item`, không tách ngoài như format cũ.
- Có thể có thêm `seoOnPage`, `breadCrumb` và `params`.
- `thumb_url`/`poster_url` có thể là đường dẫn tương đối.

```json
{
  "status": "success",
  "message": "",
  "data": {
    "params": {
      "slug": "example-slug",
      "includeUnpublished": false
    },
    "item": {
      "_id": "...",
      "name": "...",
      "slug": "example-slug",
      "episodes": []
    }
  }
}
```

## 9. Ảnh, diễn viên và từ khóa

### 9.1. Hình ảnh

```http
GET /v1/api/phim/{slug}/images
```

```json
{
  "success": true,
  "message": "success",
  "status_code": 200,
  "data": {
    "tmdb_id": 718789,
    "tmdb_type": "movie",
    "slug": "example-slug",
    "imdb_id": null,
    "image_sizes": {
      "backdrop": {
        "original": "https://image.tmdb.org/t/p/original",
        "w1280": "https://image.tmdb.org/t/p/w1280",
        "w780": "https://image.tmdb.org/t/p/w780",
        "w300": "https://image.tmdb.org/t/p/w300"
      },
      "poster": {
        "original": "https://image.tmdb.org/t/p/original",
        "w780": "https://image.tmdb.org/t/p/w780",
        "w500": "https://image.tmdb.org/t/p/w500",
        "w342": "https://image.tmdb.org/t/p/w342",
        "w185": "https://image.tmdb.org/t/p/w185",
        "w154": "https://image.tmdb.org/t/p/w154",
        "w92": "https://image.tmdb.org/t/p/w92"
      }
    },
    "images": []
  }
}
```

Thông thường một phần tử ảnh sẽ có đường dẫn tương đối của TMDB. Ghép với base size thích hợp, ví dụ:

```js
const fullPosterUrl = `${payload.data.image_sizes.poster.w500}${image.file_path}`;
```

### 9.2. Diễn viên và ê-kíp

```http
GET /v1/api/phim/{slug}/peoples
```

Phản hồi chính:

```json
{
  "success": true,
  "data": {
    "profile_sizes": {
      "original": "https://image.tmdb.org/t/p/original",
      "h632": "https://image.tmdb.org/t/p/h632",
      "w185": "https://image.tmdb.org/t/p/w185",
      "w45": "https://image.tmdb.org/t/p/w45"
    },
    "peoples": []
  }
}
```

### 9.3. Từ khóa

```http
GET /v1/api/phim/{slug}/keywords
```

Phản hồi chính:

```json
{
  "success": true,
  "data": {
    "tmdb_id": 718789,
    "tmdb_type": "movie",
    "slug": "example-slug",
    "imdb_id": null,
    "keywords": []
  }
}
```

## 10. Thể loại

### 10.1. Danh sách thể loại

```http
GET /the-loai
GET /v1/api/the-loai
```

Trang tài liệu mô tả một wrapper kiểu `status/data/items`, nhưng khi kiểm tra endpoint `/the-loai` vào ngày biên soạn, endpoint trả về **mảng JSON trực tiếp**:

```json
[
  {
    "_id": "...",
    "name": "Hành Động",
    "slug": "hanh-dong"
  }
]
```

Vì vậy, code nên hỗ trợ cả hai dạng:

```js
function readTaxonomyItems(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.data?.items ?? payload?.items ?? [];
}
```

Một số slug thể loại hiện thấy từ endpoint: `hanh-dong`, `mien-tay`, `tre-em`, `lich-su`, `co-trang`, `chien-tranh`, `vien-tuong`, `kinh-di`, `tai-lieu`, `bi-an`, `phim-18`, `tinh-cam`, `tam-ly`, `the-thao`, `phieu-luu`, `am-nhac`, `gia-dinh`, `hoc-duong`, `hai-huoc`, `hinh-su`, `vo-thuat`, `khoa-hoc`, `than-thoai`, `chinh-kich`, `kinh-dien`, `phim-ngan`.

Đừng hard-code danh sách này nếu ứng dụng cần dữ liệu luôn mới; hãy tải từ endpoint và cache.

### 10.2. Phim theo thể loại

```http
GET /v1/api/the-loai/{slug}
```

Ví dụ:

```text
https://phimapi.com/v1/api/the-loai/hanh-dong?page=1
```

Hỗ trợ bộ lọc chung. Dữ liệu phim nằm trong `data.items`.

## 11. Quốc gia

### 11.1. Danh sách quốc gia

```http
GET /quoc-gia
GET /v1/api/quoc-gia
```

Không có tham số. Mỗi mục thường có `_id`, `name`, `slug`. Hãy tải động thay vì tự duy trì danh sách quốc gia trong mã nguồn.

### 11.2. Phim theo quốc gia

```http
GET /v1/api/quoc-gia/{slug}
```

Ví dụ:

```text
https://phimapi.com/v1/api/quoc-gia/han-quoc?year=2024&page=1
```

Hỗ trợ bộ lọc chung.

## 12. Năm phát hành

### 12.1. Danh sách năm

```http
GET /nam-phat-hanh
```

Tài liệu mô tả danh sách từ năm hiện tại về năm 1911, mới nhất trước.

```json
{
  "status": "success",
  "data": {
    "items": [
      { "year": 2026 },
      { "year": 2025 }
    ]
  }
}
```

### 12.2. Phim theo năm

```http
GET /v1/api/nam/{year}
```

Ví dụ:

```text
https://phimapi.com/v1/api/nam/2024?category=hoat-hinh&page=1
```

`year` trong path là bắt buộc. Tài liệu cũng lặp lại tham số query `year` trong bảng bộ lọc chung; với endpoint này, query `year` thường là thừa và có thể gây khó hiểu. Nên dùng năm trong path làm nguồn chính.

## 13. Tìm kiếm

```http
GET /v1/api/tim-kiem?keyword={keyword}
```

| Tham số | Bắt buộc | Mô tả |
|---|:---:|---|
| `keyword` | Có | Từ khóa, khớp tên Việt và tên gốc. |
| `page` | Không | Trang hiện tại. |
| `limit` | Không | Mặc định được tài liệu nêu là 10, tối đa 64. |
| Bộ lọc chung | Không | `category`, `country`, `year`, `sort_field`, `sort_type`, `sort_lang`. |

Ví dụ:

```text
https://phimapi.com/v1/api/tim-kiem?keyword=avengers&limit=10&page=1
```

Trang tài liệu liệt kê `limit` hai lần trong bảng tham số. Đây chỉ là một tham số duy nhất.

## 14. Các cấu trúc dữ liệu quan trọng

### 14.1. Movie list item

```ts
export interface MovieListItem {
  _id: string;
  name: string;
  slug: string;
  origin_name?: string;
  alternative_names?: string[];
  type?: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  lang_key?: string[];
  sub_docquyen?: boolean;
  chieurap?: boolean;
  modified?: { time?: string };
  tmdb?: ExternalRating;
  imdb?: ExternalRating;
  category?: TaxonomyItem[];
  country?: TaxonomyItem[];
  last_episodes?: LastEpisode[];
}

export interface ExternalRating {
  id?: string | number | null;
  type?: 'movie' | 'tv' | string;
  season?: number | null;
  vote_average?: number;
  vote_count?: number;
}

export interface TaxonomyItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
}

export interface LastEpisode {
  server_name?: string;
  is_ai?: boolean;
  name?: string;
}
```

### 14.2. Movie detail

```ts
export interface MovieDetail extends MovieListItem {
  content?: string;
  status?: string;
  is_copyright?: boolean;
  is_published?: boolean;
  trailer_url?: string;
  episode_total?: number | string;
  notify?: string;
  showtimes?: string;
  view?: number;
  actor?: string[];
  director?: string[];
  created?: { time?: string };
  episodes?: EpisodeServer[]; // format v1
}

export interface EpisodeServer {
  server_name: string;
  is_ai?: boolean;
  server_data: Episode[];
}

export interface Episode {
  name: string;
  slug?: string;
  filename?: string;
  link_embed?: string;
  link_m3u8?: string;
}
```

### 14.3. Pagination

```ts
export interface Pagination {
  totalItems?: number;
  totalItemsPerPage?: number;
  currentPage?: number;
  totalPages?: number; // format cổ điển
  pageRanges?: number; // thường thấy trong format v1
}
```

## 15. Client TypeScript hoàn chỉnh, có thể dùng lại

```ts
const BASE_URL = 'https://phimapi.com';

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

function buildUrl(path: string, query: Query = {}): string {
  const url = new URL(path, BASE_URL);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function getJson<T>(
  path: string,
  query: Query = {},
  timeoutMs = 15_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path, query), {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `PhimAPI HTTP ${response.status}: ${body.slice(0, 300)}`,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const phimApi = {
  latest(page = 1) {
    return getJson('/danh-sach/phim-moi-cap-nhat', { page });
  },

  latestV2(page = 1) {
    return getJson('/danh-sach/phim-moi-cap-nhat-v2', { page });
  },

  latestV3(page = 1) {
    return getJson('/danh-sach/phim-moi-cap-nhat-v3', { page });
  },

  home(page = 1) {
    return getJson('/v1/api/home', { page });
  },

  newMovies(filters: Query = {}) {
    return getJson('/v1/api/danh-sach', filters);
  },

  listClassic(type: string, page = 1) {
    return getJson(`/danh-sach/${encodeURIComponent(type)}`, { page });
  },

  list(type: string, filters: Query = {}) {
    return getJson(
      `/v1/api/danh-sach/${encodeURIComponent(type)}`,
      filters,
    );
  },

  movie(slug: string) {
    return getJson(`/phim/${encodeURIComponent(slug)}`);
  },

  movieById(id: string) {
    return getJson(`/phim/id/${encodeURIComponent(id)}`);
  },

  movieByTmdb(type: 'movie' | 'tv', id: string | number) {
    return getJson(
      `/tmdb/${encodeURIComponent(type)}/${encodeURIComponent(String(id))}`,
    );
  },

  movieByImdb(id: string) {
    return getJson(`/imdb/title/${encodeURIComponent(id)}`);
  },

  movieV1(slug: string) {
    return getJson(`/v1/api/phim/${encodeURIComponent(slug)}`);
  },

  images(slug: string) {
    return getJson(`/v1/api/phim/${encodeURIComponent(slug)}/images`);
  },

  peoples(slug: string) {
    return getJson(`/v1/api/phim/${encodeURIComponent(slug)}/peoples`);
  },

  keywords(slug: string) {
    return getJson(`/v1/api/phim/${encodeURIComponent(slug)}/keywords`);
  },

  categories() {
    return getJson('/the-loai');
  },

  categoriesV1() {
    return getJson('/v1/api/the-loai');
  },

  byCategory(slug: string, filters: Query = {}) {
    return getJson(
      `/v1/api/the-loai/${encodeURIComponent(slug)}`,
      filters,
    );
  },

  countries() {
    return getJson('/quoc-gia');
  },

  countriesV1() {
    return getJson('/v1/api/quoc-gia');
  },

  byCountry(slug: string, filters: Query = {}) {
    return getJson(
      `/v1/api/quoc-gia/${encodeURIComponent(slug)}`,
      filters,
    );
  },

  releaseYears() {
    return getJson('/nam-phat-hanh');
  },

  byYear(year: number, filters: Query = {}) {
    return getJson(`/v1/api/nam/${year}`, filters);
  },

  search(keyword: string, filters: Query = {}) {
    return getJson('/v1/api/tim-kiem', { keyword, ...filters });
  },
};
```

## 16. Chuẩn hóa response để không phụ thuộc format

API có nhiều format và kiểu `status` không đồng nhất. Dùng các helper sau để ứng dụng dễ bảo trì hơn:

```ts
export function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export function extractMovie(payload: any): any | null {
  return payload?.movie ?? payload?.data?.item ?? null;
}

export function extractEpisodes(payload: any): any[] {
  if (Array.isArray(payload?.episodes)) return payload.episodes;
  if (Array.isArray(payload?.data?.item?.episodes)) {
    return payload.data.item.episodes;
  }
  return [];
}

export function extractPagination(payload: any): any | null {
  return payload?.pagination ?? payload?.data?.params?.pagination ?? null;
}

export function isApiSuccess(payload: any): boolean {
  if (payload?.success === true) return true;
  if (payload?.status === true) return true;
  if (payload?.status === 'success') return true;
  return false;
}
```

Không nên coi `isApiSuccess(payload) === false` là lỗi tuyệt đối nếu endpoint trả mảng trực tiếp. Trước tiên kiểm tra `Array.isArray(payload)`.

## 17. Xử lý URL ảnh đúng cách

Có ba tình huống thường gặp:

1. `thumb_url` hoặc `poster_url` đã là URL tuyệt đối.
2. Response cổ điển có `pathImage` và item chỉ chứa tên file.
3. Response v1 có đường dẫn tương đối và có thể kèm một base CDN trong payload đầy đủ.

Helper an toàn:

```ts
export function resolveImageUrl(
  value: string | undefined,
  payload: any,
): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;

  const base =
    payload?.pathImage ??
    payload?.APP_DOMAIN_CDN_IMAGE ??
    payload?.data?.APP_DOMAIN_CDN_IMAGE;

  if (!base) return value;

  return `${String(base).replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}
```

Không tự động gắn một domain cố định nếu payload không cung cấp base, vì host ảnh có thể thay đổi.

## 18. Phát tập phim

Mỗi tập có thể cung cấp:

- `link_embed`: trang player để nhúng bằng `<iframe>`.
- `link_m3u8`: luồng HLS để phát bằng video player hỗ trợ HLS.

### 18.1. Dùng `link_embed`

```html
<iframe
  src="LINK_EMBED_TU_API"
  title="Trình phát phim"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  referrerpolicy="no-referrer"
  style="width: 100%; aspect-ratio: 16 / 9; border: 0"
></iframe>
```

Chỉ gán URL đã được kiểm tra là `https:`. Đừng cho phép người dùng tùy ý nhập một URL iframe bất kỳ.

### 18.2. Dùng `link_m3u8` với HLS.js

Cài đặt:

```bash
npm install hls.js
```

Ví dụ:

```ts
import Hls from 'hls.js';

export function playHls(video: HTMLVideoElement, source: string) {
  if (!/^https:\/\//i.test(source)) {
    throw new Error('Chỉ chấp nhận nguồn HTTPS');
  }

  // Safari và một số thiết bị hỗ trợ HLS trực tiếp.
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return () => {
      video.removeAttribute('src');
      video.load();
    };
  }

  if (!Hls.isSupported()) {
    throw new Error('Trình duyệt không hỗ trợ HLS');
  }

  const hls = new Hls();
  hls.loadSource(source);
  hls.attachMedia(video);

  return () => hls.destroy();
}
```

URL m3u8 có thể hết hạn, đổi host, chặn hotlink hoặc không cho truy cập ở một số mạng. Luôn có UI báo lỗi và cho phép đổi server/tập.

## 19. Ví dụ luồng hoàn chỉnh: tìm phim rồi lấy tập

```ts
const searchPayload = await phimApi.search('lightyear', { limit: 10 });
const results = extractItems(searchPayload);

if (results.length === 0) {
  throw new Error('Không tìm thấy phim');
}

const selected = results[0];
const detailPayload = await phimApi.movie(selected.slug);
const movie = extractMovie(detailPayload);
const servers = extractEpisodes(detailPayload);

const firstEpisode = servers
  .flatMap((server: any) => server.server_data ?? [])
  .find((episode: any) => episode.link_embed || episode.link_m3u8);

console.log({ movie, firstEpisode });
```

## 20. Phân trang an toàn

Không phụ thuộc hoàn toàn vào tên `totalPages`, vì format v1 dùng `pageRanges` trong ví dụ tài liệu. Dừng khi hết item hoặc đã đạt trang cuối được báo.

```ts
async function fetchAllPages(
  fetchPage: (page: number) => Promise<any>,
  maxPages = 20,
) {
  const allItems: any[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchPage(page);
    const items = extractItems(payload);
    const pagination = extractPagination(payload);

    if (items.length === 0) break;
    allItems.push(...items);

    const lastPage = pagination?.totalPages ?? pagination?.pageRanges;
    if (typeof lastPage === 'number' && page >= lastPage) break;

    // Tránh gửi request dồn dập khi đồng bộ nhiều trang.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return allItems;
}

const movies = await fetchAllPages((page) => phimApi.latest(page), 10);
```

`maxPages` là chốt an toàn để tránh vòng lặp vô hạn nếu pagination sai hoặc thay đổi.

## 21. Python client dùng trong backend hoặc script

```python
from __future__ import annotations

from typing import Any
from urllib.parse import quote
import requests


class PhimApiClient:
    def __init__(self, base_url: str = "https://phimapi.com") -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"accept": "application/json"})

    def get(self, path: str, **params: Any) -> Any:
        clean_params = {
            key: value
            for key, value in params.items()
            if value is not None and value != ""
        }
        response = self.session.get(
            f"{self.base_url}{path}",
            params=clean_params,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    def latest(self, page: int = 1) -> Any:
        return self.get("/danh-sach/phim-moi-cap-nhat", page=page)

    def list_movies(self, movie_type: str, **filters: Any) -> Any:
        safe_type = quote(movie_type, safe="")
        return self.get(f"/v1/api/danh-sach/{safe_type}", **filters)

    def movie(self, slug: str) -> Any:
        return self.get(f"/phim/{quote(slug, safe='')}")

    def search(self, keyword: str, **filters: Any) -> Any:
        return self.get("/v1/api/tim-kiem", keyword=keyword, **filters)


client = PhimApiClient()
payload = client.search("avengers", limit=10, page=1)
print(payload)
```

## 22. PHP client cơ bản

```php
<?php

function phimApiGet(string $path, array $query = []): array
{
    $baseUrl = 'https://phimapi.com';
    $query = array_filter(
        $query,
        static fn ($value) => $value !== null && $value !== ''
    );

    $url = $baseUrl . $path;
    if ($query !== []) {
        $url .= '?' . http_build_query($query);
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ['accept: application/json'],
    ]);

    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $error !== '') {
        throw new RuntimeException('Lỗi mạng: ' . $error);
    }

    if ($status < 200 || $status >= 300) {
        throw new RuntimeException("PhimAPI HTTP {$status}");
    }

    $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    return $data;
}

$result = phimApiGet('/v1/api/tim-kiem', [
    'keyword' => 'avengers',
    'limit' => 10,
]);

print_r($result);
```

## 23. Dùng với Next.js

Nên gọi PhimAPI ở server route để có thể cache, chuẩn hóa response và tránh để giao diện phụ thuộc trực tiếp vào upstream.

```ts
// app/api/movies/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword')?.trim();

  if (!keyword) {
    return NextResponse.json(
      { error: 'Thiếu keyword' },
      { status: 400 },
    );
  }

  const upstream = new URL('https://phimapi.com/v1/api/tim-kiem');
  upstream.searchParams.set('keyword', keyword);
  upstream.searchParams.set('limit', '10');

  const response = await fetch(upstream, {
    headers: { accept: 'application/json' },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Upstream HTTP ${response.status}` },
      { status: 502 },
    );
  }

  const payload = await response.json();
  return NextResponse.json(payload);
}
```

## 24. Xử lý lỗi và retry

Các lỗi cần xử lý:

- Timeout hoặc DNS/network error.
- HTTP không thuộc 2xx.
- Body không phải JSON hợp lệ.
- `status`/`success` báo lỗi dù HTTP là 200.
- Không có `items`, `movie`, `data.item` hoặc `episodes`.
- Tập không có `link_embed` và `link_m3u8`.
- URL ảnh/video đổi host hoặc hết hạn.
- Cấu trúc `status` là boolean ở endpoint này nhưng string ở endpoint khác.

Retry chỉ nên áp dụng cho lỗi tạm thời như `408`, `429`, `500`, `502`, `503`, `504`, và dùng exponential backoff có jitter. Không retry liên tục với `400` hoặc `404`.

```ts
async function withRetry<T>(
  operation: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;

      const delay = 300 * 2 ** (attempt - 1) + Math.random() * 150;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

Trong ứng dụng production, hãy phân loại lỗi trước khi retry thay vì retry mọi exception.

## 25. Cache và đồng bộ dữ liệu

Gợi ý thực tế:

| Loại dữ liệu | Cache gợi ý |
|---|---:|
| Danh sách thể loại / quốc gia / năm | 6–24 giờ |
| Danh sách phim mới | 1–5 phút |
| Tìm kiếm | 30–120 giây theo từ khóa |
| Chi tiết phim | 5–30 phút |
| Hình ảnh / diễn viên / keyword | 6–24 giờ |
| Link tập | Cache ngắn; có thể thay đổi hoặc hết hạn |

Đây là gợi ý kỹ thuật, không phải rate-limit chính thức của KKPhim. Tài liệu không công bố giới hạn request.

Nếu đồng bộ vào cơ sở dữ liệu riêng:

1. Dùng `_id` làm khóa upstream khi có.
2. Lưu `slug`, TMDB ID và IMDb ID làm khóa phụ.
3. So sánh `modified.time` để biết phim có thay đổi.
4. Upsert thay vì insert mù.
5. Không xóa dữ liệu chỉ vì một lần request trả rỗng.
6. Lưu thời điểm `last_synced_at` và lỗi gần nhất.
7. Không lưu link m3u8 lâu dài nếu chưa xác nhận tính ổn định.

## 26. Bảo mật phía ứng dụng

- Sanitize `movie.content` trước khi render HTML.
- Chỉ chấp nhận URL `https:` cho ảnh, trailer, iframe và m3u8.
- Không chuyển nguyên lỗi upstream hoặc stack trace cho người dùng cuối.
- Giới hạn độ dài `keyword`, `slug` và các query do người dùng nhập.
- Dùng `URL`/`URLSearchParams`, không nối chuỗi query bằng dữ liệu thô.
- Nếu làm proxy, chỉ cho phép các path đã khai báo; không tạo open proxy tới URL tùy ý.
- Thêm timeout, giới hạn response size và circuit breaker khi upstream bất ổn.
- Không tin `_id`, slug hoặc HTML từ API là dữ liệu đã an toàn.

## 27. Các điểm không nhất quán cần nhớ

1. Trang có thương hiệu KKPhim nhưng phần giới thiệu có câu “API của PhimAPI”. Base API được chỉ rõ là `phimapi.com`.
2. `/the-loai` thực tế có thể trả mảng trực tiếp, trong khi tài liệu minh họa wrapper `status/data/items`.
3. `status` có lúc là boolean (`true`), có lúc là string (`"success"`); endpoint mở rộng dùng `success: true`.
4. Format cũ để `items`/`movie`/`episodes` ở cấp gốc; format v1 thường bọc trong `data`.
5. `episodes` của chi tiết cũ nằm ngoài `movie`; ở chi tiết v1 nằm trong `data.item`.
6. `thumb_url` và `poster_url` có thể là URL tuyệt đối, tên file hoặc đường dẫn tương đối.
7. Tài liệu tìm kiếm liệt kê `limit` hai lần.
8. Bảng IMDb liệt kê `type`, nhưng endpoint ví dụ chỉ cần IMDb ID.
9. `pageRanges` trong response v1 có thể không đồng nghĩa hoàn toàn với `totalPages`; luôn có chốt dừng theo số item và `maxPages`.
10. Bản v2/v3 của phim mới được nhắc tới nhưng không có schema riêng đầy đủ.
11. Tài liệu nói `limit` chủ yếu áp dụng cho tìm kiếm, trong khi bảng bộ lọc được lặp ở nhiều endpoint. Đừng giả định `limit` hoạt động giống nhau ở mọi danh sách.
12. `phim-chieu-rap` được liệt kê cho endpoint cũ nhưng không nằm trong danh sách `type` của endpoint v1 trên trang tài liệu.

## 28. Checklist trước khi đưa lên production

- [ ] Dùng backend/proxy hoặc server component thay vì gọi upstream ở mọi component client.
- [ ] Có timeout 10–15 giây.
- [ ] Có cache phù hợp.
- [ ] Có retry chọn lọc và exponential backoff.
- [ ] Có parser hỗ trợ format cũ, v1 và mảng trực tiếp.
- [ ] Sanitize HTML nội dung phim.
- [ ] Chuẩn hóa URL ảnh.
- [ ] Có fallback khi không có poster/tập/link phát.
- [ ] Có UI đổi server và báo lỗi player.
- [ ] Không hard-code toàn bộ thể loại/quốc gia.
- [ ] Theo dõi thay đổi contract bằng test định kỳ.
- [ ] Kiểm tra bản quyền và điều khoản sử dụng trước khi công khai nội dung.

## 29. Smoke test đề xuất

Chạy định kỳ các test sau để phát hiện API thay đổi:

```ts
import assert from 'node:assert/strict';

const categoryPayload = await phimApi.categories();
assert.ok(extractItems(categoryPayload).length > 0);

const latestPayload = await phimApi.latest(1);
const latestItems = extractItems(latestPayload);
assert.ok(latestItems.length > 0);
assert.equal(typeof latestItems[0].slug, 'string');

const searchPayload = await phimApi.search('avengers', { limit: 1 });
assert.ok(Array.isArray(extractItems(searchPayload)));
```

Đừng kiểm tra cứng tên một phim cụ thể vì dữ liệu cập nhật liên tục.

## 30. Công thức URL thường dùng

```text
# Phim mới
https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1

# Trang chủ
https://phimapi.com/v1/api/home?page=1

# Phim lẻ Hàn Quốc năm 2024
https://phimapi.com/v1/api/danh-sach/phim-le?country=han-quoc&year=2024&page=1

# Thể loại hành động
https://phimapi.com/v1/api/the-loai/hanh-dong?page=1

# Phim Hàn Quốc năm 2024
https://phimapi.com/v1/api/quoc-gia/han-quoc?year=2024&page=1

# Hoạt hình năm 2024
https://phimapi.com/v1/api/nam/2024?category=hoat-hinh&page=1

# Tìm kiếm
https://phimapi.com/v1/api/tim-kiem?keyword=avengers&limit=10&page=1

# Chi tiết theo slug
https://phimapi.com/phim/ten-phim-slug

# Chi tiết v1
https://phimapi.com/v1/api/phim/ten-phim-slug

# Ảnh, diễn viên, từ khóa
https://phimapi.com/v1/api/phim/ten-phim-slug/images
https://phimapi.com/v1/api/phim/ten-phim-slug/peoples
https://phimapi.com/v1/api/phim/ten-phim-slug/keywords
```

## 31. Nguồn và phạm vi

Tài liệu này được biên soạn từ:

- Trang API Documentation của KKPhim: `https://kkphim2.com/api-document`
- Base API do tài liệu chỉ định: `https://phimapi.com`
- Kiểm tra trực tiếp endpoint thể loại: `https://phimapi.com/the-loai`
- Các ảnh chụp giao diện tài liệu do người yêu cầu cung cấp.

Ngày rà soát: **2026-07-23**.

Vì API có thể thay đổi sau ngày này, hãy ưu tiên payload thực tế, viết parser linh hoạt và kiểm tra lại trang tài liệu trước mỗi lần nâng cấp lớn.
