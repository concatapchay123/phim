TÀI LIỆU TÍCH HỢP API OPHIM (Dành cho AI Assistant)

1. THÔNG TIN CHUNG (GLOBAL CONFIGURATION)

Base URL: https://ophim1.com

Giao thức: HTTPS

Phương thức mặc định: GET (Áp dụng cho toàn bộ API)

Header bắt buộc: Accept: application/json

Định dạng dữ liệu trả về: JSON

Encoding: UTF-8

2. WORKFLOW 1: TRANG CHỦ & DANH SÁCH CHUNG

1.1. Lấy danh sách phim trang chủ

Mô tả: Lấy danh sách phim hiển thị trên trang chủ (phim mới, phim hot...).

Endpoint: /v1/api/home

Method: GET

command "using GO language": 

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/home"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

1.2. Lấy danh sách phim theo danh mục / bộ lọc chung

Mô tả: Lấy danh sách phim thuộc một danh sách cụ thể (ví dụ: phim bộ, phim lẻ) kết hợp bộ lọc.

Endpoint: /v1/api/danh-sach/{slug}

Method: GET

Path Parameters:

slug (String - Bắt buộc): Slug của danh sách (VD: phim-moi, phim-le, phim-bo).

Query Parameters:

page (Number - Tùy chọn): Số trang (Mặc định: 1)

limit (Number - Tùy chọn): Số lượng phim/trang (Mặc định: 24)

sort_field (String - Tùy chọn): Trường sắp xếp (VD: modified.time, year)

sort_type (String - Tùy chọn): Kiểu sắp xếp (desc hoặc asc)

category (String - Tùy chọn): Lọc theo slug thể loại (VD: hanh-dong,tinh-cam)

country (String - Tùy chọn): Lọc theo slug quốc gia (VD: trung-quoc,han-quoc)

year (Number - Tùy chọn): Lọc theo năm sản xuất (VD: 2023)

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/danh-sach/[slug]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

3. WORKFLOW 2: TÌM KIẾM

2.1. Tìm kiếm phim theo từ khóa

Mô tả: Tìm kiếm phim bằng text.

Endpoint: /v1/api/tim-kiem

Method: GET

Query Parameters:

keyword (String - Bắt buộc): Từ khóa tìm kiếm (Tối thiểu 2 ký tự, VD: avengers).

page (Number - Tùy chọn): Số trang (Mặc định: 1).

limit (Number - Tùy chọn): Số lượng phim/trang (Mặc định: 24).

command "using GO language": 

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/tim-kiem?keyword=[keyword]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

4. WORKFLOW 3: DUYỆT PHIM THEO THỂ LOẠI / QUỐC GIA / NĂM

3.1. Dữ liệu Thể Loại (Categories)

Lấy danh sách tất cả thể loại: - Endpoint: /v1/api/the-loai

comand "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/the-loai"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

Lấy danh sách phim thuộc 1 thể loại (có hỗ trợ lọc):

Endpoint: /v1/api/the-loai/{slug}

Path Parameters: slug (Bắt buộc) - VD: hanh-dong

Query Parameters: Hỗ trợ page, limit, sort_field, sort_type, country, year (Giống mục 1.2).

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/the-loai/[slug]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

3.2. Dữ liệu Quốc Gia (Countries)

Lấy danh sách tất cả quốc gia: - Endpoint: /v1/api/quoc-gia

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/quoc-gia"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

Lấy danh sách phim thuộc 1 quốc gia (có hỗ trợ lọc):

Endpoint: /v1/api/quoc-gia/{slug}

Path Parameters: slug (Bắt buộc) - VD: han-quoc

Query Parameters: Hỗ trợ page, limit, sort_field, sort_type, category, year (Giống mục 1.2).

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/quoc-gia/[slug]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

3.3. Dữ liệu Năm Phát Hành (Years)

Lấy danh sách tất cả năm phát hành: - Endpoint: /v1/api/nam-phat-hanh

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/nam-phat-hanh"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

Lấy danh sách phim theo năm (có hỗ trợ lọc):

Endpoint: /v1/api/nam-phat-hanh/{year}

Path Parameters: year (Number - Bắt buộc) - VD: 2024

Query Parameters: Hỗ trợ page, limit, sort_field, sort_type, category, country (Giống mục 1.2).

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/nam-phat-hanh/[year]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

5. WORKFLOW 4: CHI TIẾT PHIM (MOVIE DETAILS)

Tất cả các API dưới đây đều dùng slug của phim làm định danh.

4.1. Thông tin chi tiết phim

Mô tả: Lấy thông tin chung, nội dung, điểm số, v.v.

Endpoint: /v1/api/phim/{slug}

Path Parameters: slug (String - Bắt buộc) - VD: tro-choi-con-muc

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/phim/[slug]"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

4.2. Hình ảnh phim (từ TMDB)

Mô tả: Lấy danh sách poster, backdrop chất lượng cao.

Endpoint: /v1/api/phim/{slug}/images

Path Parameters: slug (String - Bắt buộc)

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/phim/[slug]/images"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

4.3. Thông tin diễn viên, đạo diễn

Mô tả: Lấy cast & crew của phim.

Endpoint: /v1/api/phim/{slug}/peoples

Path Parameters: slug (String - Bắt buộc)

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/phim/[slug]/peoples"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

4.4. Từ khóa phim (Keywords)

Mô tả: Lấy các thẻ tags/từ khóa liên quan đến phim.

Endpoint: /v1/api/phim/{slug}/keywords

Path Parameters: slug (String - Bắt buộc)

command "using GO language":

package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://ophim1.com/v1/api/phim/[slug]/keywords"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("accept", "application/json")
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}

6. LƯU Ý DÀNH CHO AI ASSISTANT KHI VIẾT CODE

URL Construction: Luôn ghép Base URL (https://ophim1.com) với Endpoint.

Path vs Query Params: Chú ý phân biệt {slug} nằm trong URL Path và ?page=1&limit=24 nằm trong Query. Cần encode URI Component cho query params nếu cần thiết.

Error Handling: Luôn bọc các hàm call API bằng try...catch. Kiểm tra response HTTP status (VD: response.ok) trước khi parse JSON.

Pagination: Các API dạng danh sách và tìm kiếm đều trả về phân trang. Hãy thiết kế state/biến phù hợp để xử lý tính năng "Load more" hoặc "Pagination" trên UI.