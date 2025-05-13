import React, { useEffect } from "react";
import basicRocket from "/src/assets/rocket_design1.svg";
import punkRocket from "/src/assets/rocket_design2.svg";
import fantasyRocket from "/src/assets/rocket_design3.svg";
import safeRocket from "/src/assets/rocket_design4.svg";
import styles from "/src/style/DesignSelector.module.css";

export { basicRocket, punkRocket, fantasyRocket, safeRocket };

export const designs = [
  // { id: 'design1', label: '기본 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds1.jpg' || basicRocket },
  // { id: 'design2', label: '사이버펑크 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds2.jpg' || punkRocket },
  // { id: 'design3', label: '몽환 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds3.jpg' || fantasyRocket },
  // { id: 'design4', label: '안전 로켓', imgUrl: 'http://localhost:8081/images/rocket_design/ds3.jpg' || safeRocket },

  { id: 'design1', label: '기본 로켓', imgUrl: basicRocket },
  { id: 'design2', label: '사이버펑크 로켓', imgUrl: punkRocket },
  { id: 'design3', label: '몽환 로켓', imgUrl: fantasyRocket },
  { id: 'design4', label: '안전 로켓', imgUrl: safeRocket },
];

function DesignSelector({ currentIdx, setCurrentIdx, setDesignImgUrl }) {
  const prev = () => setCurrentIdx(i => (i === 0 ? designs.length - 1 : i - 1));
  const next = () => setCurrentIdx(i => (i === designs.length - 1 ? 0 : i + 1));

   return (
    <div className={styles.container}>
      <h3 className={styles.title}>로켓 디자인 선택</h3>
      <div className={styles.carouselContainer}>

         <div className={`${styles.star} ${styles["star-1"]}`}></div>
        <div className={`${styles.star} ${styles["star-2"]}`}></div>
        <div className={`${styles.star} ${styles["star-3"]}`}></div>
        <div className={`${styles.star} ${styles["star-4"]}`}></div>
        <div className={`${styles.star} ${styles["star-5"]}`}></div>
        <div className={`${styles.star} ${styles["star-6"]}`}></div>
        <div className={`${styles.star} ${styles["star-7"]}`}></div>
        <div className={`${styles.star} ${styles["star-8"]}`}></div>
        <div className={`${styles.star} ${styles["star-9"]}`}></div>


        <button type="button" className={styles.navigationButton} onClick={prev}>◀</button>
        <div className={styles.selectedDesign}>
          <div className={styles.imageContainer}>
            <img 
              src={designs[currentIdx].imgUrl} 
              alt={designs[currentIdx].label} 
              className={styles.image} 
            />
          </div>
          <div className={styles.label}>{designs[currentIdx].label}</div>
        </div>
        <button type="button" className={styles.navigationButton} onClick={next}>▶</button>
      </div>
      <div className={styles.thumbnailGrid}>
        {designs.map((d, idx) => (
          <div
            key={d.id}
            onClick={() => setCurrentIdx(idx)}
            className={`${styles.thumbnailItem} ${idx === currentIdx ? styles.thumbnailActive : ''}`}
          >
            <img 
              src={d.imgUrl} 
              alt={d.label} 
              className={styles.thumbnailImage} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignSelector;