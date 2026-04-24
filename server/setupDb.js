require('dotenv').config();
const { Pool } = require('pg');

async function setupDatabase() {
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'erolakarsu',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const dbName = process.env.DB_NAME || 'climate_forecaster';
    const res = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error setting up database:', err.message);
  } finally {
    await adminPool.end();
  }

  // Now create tables
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'climate_forecaster',
    user: process.env.DB_USER || 'erolakarsu',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS climate_patterns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        pattern_type VARCHAR(100),
        region VARCHAR(255),
        severity VARCHAR(50),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS weather_forecasts (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        forecast_date DATE,
        temperature_high DECIMAL,
        temperature_low DECIMAL,
        precipitation_chance INTEGER,
        wind_speed DECIMAL,
        humidity INTEGER,
        conditions VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS temperature_predictions (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        prediction_date DATE,
        predicted_temp DECIMAL,
        actual_temp DECIMAL,
        confidence DECIMAL,
        model_used VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS precipitation_analysis (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        analysis_period VARCHAR(100),
        total_rainfall DECIMAL,
        avg_rainfall DECIMAL,
        max_rainfall DECIMAL,
        drought_index DECIMAL,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS drought_assessments (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        risk_level VARCHAR(50),
        drought_index DECIMAL,
        soil_moisture DECIMAL,
        vegetation_index DECIMAL,
        water_reserves DECIMAL,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS flood_predictions (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        risk_level VARCHAR(50),
        river_level DECIMAL,
        rainfall_forecast DECIMAL,
        soil_saturation DECIMAL,
        population_affected INTEGER,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS storm_tracking (
        id SERIAL PRIMARY KEY,
        storm_name VARCHAR(255) NOT NULL,
        storm_type VARCHAR(100),
        category VARCHAR(50),
        current_location VARCHAR(255),
        wind_speed DECIMAL,
        pressure DECIMAL,
        direction VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sea_level_projections (
        id SERIAL PRIMARY KEY,
        coastal_region VARCHAR(255) NOT NULL,
        current_level DECIMAL,
        projected_rise DECIMAL,
        projection_year INTEGER,
        confidence DECIMAL,
        impact_assessment TEXT,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS air_quality (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        aqi_value INTEGER,
        pm25 DECIMAL,
        pm10 DECIMAL,
        ozone DECIMAL,
        co_level DECIMAL,
        category VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carbon_emissions (
        id SERIAL PRIMARY KEY,
        source VARCHAR(255) NOT NULL,
        emission_type VARCHAR(100),
        amount_tons DECIMAL,
        measurement_date DATE,
        sector VARCHAR(100),
        reduction_target DECIMAL,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crop_yield_predictions (
        id SERIAL PRIMARY KEY,
        crop_name VARCHAR(255) NOT NULL,
        region VARCHAR(255),
        predicted_yield DECIMAL,
        unit VARCHAR(50),
        season VARCHAR(50),
        climate_impact VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS insurance_risk (
        id SERIAL PRIMARY KEY,
        property_type VARCHAR(100) NOT NULL,
        location VARCHAR(255),
        risk_score DECIMAL,
        climate_risk_factor VARCHAR(100),
        premium_adjustment DECIMAL,
        coverage_recommendation TEXT,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS real_estate_climate_risk (
        id SERIAL PRIMARY KEY,
        property_address VARCHAR(255) NOT NULL,
        city VARCHAR(255),
        risk_score DECIMAL,
        flood_risk VARCHAR(50),
        fire_risk VARCHAR(50),
        heat_risk VARCHAR(50),
        projected_impact TEXT,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS historical_climate_data (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        time_period VARCHAR(100),
        avg_temperature DECIMAL,
        avg_precipitation DECIMAL,
        notable_events TEXT,
        trend VARCHAR(100),
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS climate_alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50),
        region VARCHAR(255),
        message TEXT,
        active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        description TEXT,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('All tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
