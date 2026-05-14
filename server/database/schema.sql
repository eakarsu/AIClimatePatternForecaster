-- Climate Pattern Forecaster Database Schema

-- Climate Patterns table
CREATE TABLE IF NOT EXISTS climate_patterns (
  id SERIAL PRIMARY KEY,
  region VARCHAR(255) NOT NULL,
  pattern_type VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  severity VARCHAR(50),
  data_json JSONB DEFAULT '{}',
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather Forecasts table
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id SERIAL PRIMARY KEY,
  location VARCHAR(255) NOT NULL,
  forecast_date DATE,
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  temperature_high DECIMAL(5,2),
  temperature_low DECIMAL(5,2),
  precipitation DECIMAL(5,2),
  precipitation_chance DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  humidity DECIMAL(5,2),
  confidence DECIMAL(5,2),
  conditions VARCHAR(100),
  description TEXT,
  data_json JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Climate Analyses table (AI results)
CREATE TABLE IF NOT EXISTS climate_analyses (
  id SERIAL PRIMARY KEY,
  analysis_type VARCHAR(100) NOT NULL,
  input_data_json JSONB DEFAULT '{}',
  ai_result_json JSONB DEFAULT '{}',
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  region VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  description TEXT,
  data_json JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historical Data table (weather station records)
CREATE TABLE IF NOT EXISTS historical_data (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  temperature DECIMAL(5,2),
  precipitation DECIMAL(6,2),
  wind_speed DECIMAL(5,2),
  humidity DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_climate_patterns_region ON climate_patterns(region);
CREATE INDEX IF NOT EXISTS idx_climate_patterns_severity ON climate_patterns(severity);
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_location ON weather_forecasts(location);
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_date ON weather_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(active);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_historical_data_station ON historical_data(station_id);
CREATE INDEX IF NOT EXISTS idx_historical_data_date ON historical_data(date);
CREATE INDEX IF NOT EXISTS idx_climate_analyses_type ON climate_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_climate_analyses_user ON climate_analyses(user_id);
