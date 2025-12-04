// components/admin-v2/EnhancedAnalyticsDashboard.tsx
// Enhanced Admin Analytics Dashboard with Smart Metrics Visualization
// Features: Real-time sync, animated progress rings, interactive tooltips

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Heart, TrendingUp, Award, Sparkles } from 'lucide-react';
import { SmartMetricCard } from './SmartMetricCard';
import { useAnalyticsSummary } from '../../src/hooks/useAnalyticsSummary';

export function EnhancedAnalyticsDashboard() {
  const { data: summary, isLoading, isFetching } = useAnalyticsSummary();
  const [previousSummary, setPreviousSummary] = useState(summary);

  // Track when data changes for glow effect
  useEffect(() => {
    if (summary && JSON.stringify(summary) !== JSON.stringify(previousSummary)) {
      setPreviousSummary(summary);
    }
  }, [summary, previousSummary]);

  if (isLoading) {
    return (
      <div style={{ padding: '40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                height: '280px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Events Hosted',
      value: summary?.events_hosted || 0,
      icon: Calendar,
      color: '#B6F500',
      glowColor: '#98CD00',
      unit: '+',
      showProgressRing: false,
      delay: 0,
    },
    {
      title: 'Guests Served',
      value: summary?.guests_served || 0,
      icon: Users,
      color: '#E0C097',
      glowColor: '#D4A574',
      unit: '+',
      showProgressRing: false,
      delay: 150,
    },
    {
      title: 'Client Satisfaction',
      value: summary?.client_satisfaction || 0,
      maxValue: 100,
      icon: Heart,
      color: '#FF6B9D',
      glowColor: '#FF8FAB',
      unit: '%',
      showProgressRing: true,
      delay: 300,
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Header with real-time indicator */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2
            style={{
              fontSize: '1.875rem',
              fontWeight: '800',
              color: '#2A2A2A',
              margin: 0,
            }}
          >
            Analytics Overview
          </h2>
          
          {/* Real-time sync indicator */}
          <motion.div
            animate={{
              opacity: isFetching ? [1, 0.5, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: isFetching ? Infinity : 0,
              ease: 'easeInOut',
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: isFetching
                ? 'linear-gradient(135deg, rgba(182, 245, 0, 0.15), rgba(152, 205, 0, 0.15))'
                : 'rgba(0, 0, 0, 0.05)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: isFetching ? '#98CD00' : '#666666',
            }}
          >
            <motion.div
              animate={{ rotate: isFetching ? 360 : 0 }}
              transition={{ duration: 2, repeat: isFetching ? Infinity : 0, ease: 'linear' }}
            >
              <Sparkles size={16} />
            </motion.div>
            {isFetching ? 'Syncing...' : 'Real-time'}
          </motion.div>
        </div>
        
        <p style={{ fontSize: '0.9375rem', color: '#666666', margin: 0 }}>
          Live metrics from your Dream Avenue Convention Center
        </p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        {metrics.map((metric, index) => (
          <SmartMetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            maxValue={metric.maxValue}
            icon={metric.icon}
            color={metric.color}
            glowColor={metric.glowColor}
            unit={metric.unit}
            showProgressRing={metric.showProgressRing}
            updatedAt={summary?.updated_at || undefined}
            updatedBy={summary?.updated_by || undefined}
            isUpdating={isFetching}
            delay={metric.delay}
          />
        ))}
      </div>

      {/* Additional Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{
          background: 'linear-gradient(135deg, rgba(182, 245, 0, 0.1), rgba(224, 192, 151, 0.1))',
          borderRadius: '24px',
          padding: '32px',
          border: '2px solid rgba(182, 245, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B6F500, #98CD00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2A2A2A', margin: 0 }}>
              Performance Insights
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666666', margin: 0 }}>
              Your venue is performing exceptionally well
            </p>
          </div>
        </div>

        {/* Insight Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              icon: Award,
              label: 'Excellence Rating',
              value: '4.9/5',
              color: '#E0C097',
            },
            {
              icon: TrendingUp,
              label: 'Growth Rate',
              value: '+28%',
              color: '#B6F500',
            },
            {
              icon: Users,
              label: 'Avg. Group Size',
              value: summary?.guests_served && summary?.events_hosted
                ? Math.round(summary.guests_served / summary.events_hosted)
                : '50',
              color: '#FF6B9D',
            },
          ].map((insight, index) => (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              style={{
                background: '#FFFFFF',
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `${insight.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: insight.color,
                }}
              >
                <insight.icon size={20} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '2px' }}>
                  {insight.label}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2A2A2A' }}>
                  {insight.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(182, 245, 0, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 192, 151, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}
