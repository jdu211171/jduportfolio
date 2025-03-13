import React, { useEffect, useState, useRef } from 'react';
import styles from "./CreditsProgressBar.module.css"

const CreditsProgressBar = ({ breakpoints, unit, credits, semester}) => {
    let color = "red"
    if (credits > 124) {
      color = "blue"
    } else if (124/9 * Number(semester) < credits) {
      color = "green"
    } 
    let totalPoints = breakpoints[breakpoints.length - 1].point > credits ? breakpoints[breakpoints.length - 1].point : credits;
    if (totalPoints < credits) {
      totalPoints = credits
    }
    const creditPercentage = (credits / totalPoints) * 100;

    const graphContainerRef = useRef(null);

    useEffect(() => {
      const graphContainer = graphContainerRef.current;
      const checkScrollable = () => {
        if (graphContainer.scrollWidth > graphContainer.clientWidth) {
          graphContainer.classList.add(styles.scrollable);
        } else {
          graphContainer.classList.remove(styles.scrollable);
        }
      };

      checkScrollable(); // Initial check
      window.addEventListener("resize", checkScrollable); // Check on resize

      return () => {
        window.removeEventListener("resize", checkScrollable);
      };
    }, []);  

  return (
    <div className={styles.graphContainer} ref={graphContainerRef}>
        <svg width="100%" height="120" style={{ overflow: 'visible' }}>
            {/* Base line */}
            <line x1="0" y1="60" x2="100%" y2="60" stroke="#000" strokeWidth="2" />

            {/* Breakpoints */}
            {breakpoints.map((breakpoint, index) => {
                const x = `${(breakpoint.point / totalPoints) * 100}%`;
                if (breakpoint.point <= 124) {
                  return (
                    <g key={index}>
                        <line x1={x} y1="50" x2={x} y2="70" stroke="#000" strokeWidth="2" />
                        <text x={x} y="40" textAnchor="middle" fontSize="12">{breakpoint.label}</text>
                        <text x={x} y="90" textAnchor="middle" fontSize="12">{breakpoint.point}{unit}</text>
                    </g>
                    );
                } else {
                
                }
            })}

            {/* Credit Indicator */}
            <g>
                <line x1={`${creditPercentage}%`} y1="55" x2={`${creditPercentage}%`} y2="130" stroke={color} strokeWidth="2" />
                <text x={`${creditPercentage}%`} y="150" textAnchor="middle" fontSize="12" fill={color}>学生単位数: {credits}</text>
            </g>
        </svg>
    </div>
  );
};

export default CreditsProgressBar;
