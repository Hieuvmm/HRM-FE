"use client";

import "./style.scss";
import "./css.scss";
import { useState, useRef, useEffect } from "react";
import { Carousel, Card, Badge, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { getBanners, getContents } from "../../apis/Editor.api";
import { useNavigate } from "react-router-dom";

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }) => (
  <div className="custom-arrow custom-prev-arrow" onClick={onClick}>
    <LeftOutlined />
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div className="custom-arrow custom-next-arrow" onClick={onClick}>
    <RightOutlined />
  </div>
);

function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function Dashboard() {
  const [bannerSlides, setBannerSlides] = useState([]);
  const [companyNews, setCompanyNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const carouselRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [expandedNews, setExpandedNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bannerRes, contentRes] = await Promise.all([
          getBanners(),
          getContents(),
        ]);
        setBannerSlides(
          (bannerRes.data || []).map((item) => ({
            id: item.id,
            image: `${process.env.VITE_URL_MINIO}${item.imageUrl}`,
            title: item.label,
            description: `Banner #${item.position}`,
          }))
        );
        setCompanyNews(
          (contentRes.data || [])
            .map((item) => ({
              id: item.id,
              title: item.title,
              date: item.date,
              content: item.body,
              type: item.type,
              image: Array.isArray(item.imageUrls)
                ? item.imageUrls.length > 0
                  ? `${process.env.VITE_URL_MINIO}${item.imageUrls[0]}`
                  : undefined
                : item.imageUrls
                ? `${process.env.VITE_URL_MINIO}${item.imageUrls}`
                : undefined,
              imageUrls: Array.isArray(item.imageUrls)
                ? item.imageUrls
                : item.imageUrls
                ? [item.imageUrls]
                : [],
              badge: item.badge
                ? typeof item.badge === "string"
                  ? JSON.parse(item.badge)
                  : item.badge
                : { text: "", color: "gray" },
              position: item.position,
            }))
            .sort((a, b) => a.position - b.position)
        );
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const carouselSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    dots: true,
    effect: "fade",
    pauseOnHover: true,
    className: "banner-carousel",
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: "custom-dots",
  };

  const minioPrefix = process.env.VITE_URL_MINIO
    ? process.env.VITE_URL_MINIO.endsWith("/")
      ? process.env.VITE_URL_MINIO
      : process.env.VITE_URL_MINIO + "/"
    : "/";

  return (
    <div className="bang-tin-container">
      <div className="carousel-container">
        <Carousel
          {...carouselSettings}
          ref={carouselRef}
          autoplay={true}
          autoplaySpeed={4000}
        >
          {bannerSlides.map((slide) => (
            <div key={slide.id}>
              <div className="carousel-item">
                <div className="carousel-image">
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title}
                  />
                  <div className="carousel-overlay"></div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="news-container">
        <h2 className="section-title">Tin tức nội bộ</h2>
        {companyNews.map((news) => {
          const isExpanded = expandedNews.includes(news.id);
          const shortText =
            stripHtml(news.content).slice(0, 120) +
            (stripHtml(news.content).length > 120 ? "..." : "");

          return (
            <Card
              key={news.id}
              className={`news-item ${isExpanded ? "selected-news" : ""}`}
              hoverable
            >
              <div className="news-content-wrapper">
                {/* Ảnh bên trái - chỉ hiển thị khi không mở rộng và có ảnh */}
                {!isExpanded && news.image && (
                  <div className="news-image-left">
                    <img
                      src={
                        news.image.startsWith("http")
                          ? news.image
                          : `${minioPrefix}${
                              news.image.startsWith("/")
                                ? news.image.slice(1)
                                : news.image
                            }`
                      }
                      alt={news.title || "Content Image"}
                    />
                  </div>
                )}

                {/* Nội dung bên phải */}
                <div className="news-content">
                  <h3 className="news-title">{news.title}</h3>
                  <div className="news-meta">
                    <Badge color={news.badge.color} text={news.badge.text} />
                    <span className="news-date">
                      {news.date
                        ? new Date(news.date).toLocaleDateString("vi-VN")
                        : "Không rõ ngày"}
                    </span>
                  </div>
                  <div className="news-text">
                    {isExpanded ? (
                      <>
                        <div
                          dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                        {/* Hiển thị toàn bộ ảnh dưới nội dung khi mở rộng */}
                        {news.imageUrls.length > 0 && (
                          <div className="news-images-expanded">
                            {news.imageUrls.map((img, idx) => (
                              <img
                                key={idx}
                                src={
                                  img.startsWith("http")
                                    ? img
                                    : `${minioPrefix}${
                                        img.startsWith("/") ? img.slice(1) : img
                                      }`
                                }
                                alt={`Content Image ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <span>{shortText}</span>
                    )}
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() =>
                      navigate(`/dashboard/news/${news.id}`, {
                        state: { news },
                      })
                    }
                  >
                    Đọc thêm
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
