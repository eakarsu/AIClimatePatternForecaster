require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'climate_forecaster',
  user: process.env.DB_USER || 'erolakarsu',
  password: process.env.DB_PASSWORD || '',
});

function requireDemoPassword() {
  const password = process.env.DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD || process.env.DEMO_SEED_PASSWORD || '';
  if (password.length < 12 || password.length > 1024) throw new Error('DEMO_PASSWORD must contain 12-1024 characters');
  return password;
}

async function seed() {
  try {
    // Clear existing data
    await pool.query(`
      TRUNCATE users, climate_patterns, weather_forecasts, temperature_predictions,
      precipitation_analysis, drought_assessments, flood_predictions, storm_tracking,
      sea_level_projections, air_quality, carbon_emissions, crop_yield_predictions,
      insurance_risk, real_estate_climate_risk, historical_climate_data, climate_alerts
      RESTART IDENTITY CASCADE;
    `);

    // Seed Users
    const hashedPassword = await bcrypt.hash(requireDemoPassword(), 10);
    await pool.query(`
      INSERT INTO users (email, password, name) VALUES
      ('admin@climate.com', $1, 'Admin User'),
      ('analyst@climate.com', $1, 'Climate Analyst')
    `, [hashedPassword]);
    console.log('Users seeded.');

    // 1. Climate Patterns (15 items)
    await pool.query(`
      INSERT INTO climate_patterns (name, pattern_type, region, severity, description, data) VALUES
      ('El Niño 2024', 'ENSO', 'Pacific Ocean', 'High', 'Strong El Niño event causing widespread warming in equatorial Pacific', '{"phase": "warm", "sst_anomaly": 2.1, "impact_regions": ["South America", "Australia", "Southeast Asia"]}'),
      ('La Niña Watch', 'ENSO', 'Pacific Ocean', 'Moderate', 'Transitioning La Niña conditions expected by Q3', '{"phase": "cool", "sst_anomaly": -0.8, "probability": 65}'),
      ('Arctic Amplification', 'Polar', 'Arctic Circle', 'Critical', 'Accelerated warming in Arctic regions at 3x global average', '{"warming_rate": 3.2, "ice_extent_loss": "12%", "permafrost_thaw": true}'),
      ('Indian Ocean Dipole', 'IOD', 'Indian Ocean', 'Moderate', 'Positive IOD phase affecting East African and Australian rainfall', '{"iod_index": 1.4, "affected_regions": ["East Africa", "Australia"]}'),
      ('North Atlantic Oscillation', 'NAO', 'North Atlantic', 'Low', 'Positive NAO phase bringing mild winters to Northern Europe', '{"nao_index": 1.8, "winter_impact": "mild", "storm_track": "northward"}'),
      ('Pacific Decadal Oscillation', 'PDO', 'North Pacific', 'Moderate', 'Shift to positive PDO phase detected', '{"pdo_index": 0.9, "duration_years": 3, "fishery_impact": "significant"}'),
      ('Madden-Julian Oscillation', 'MJO', 'Tropics', 'Low', 'Active MJO phase 3 enhancing convection over Maritime Continent', '{"phase": 3, "amplitude": 2.1, "propagation_speed": "5m/s"}'),
      ('Jet Stream Waviness', 'Atmospheric', 'Northern Hemisphere', 'High', 'Increased jet stream meridional amplitude causing extreme weather', '{"waviness_index": 3.4, "blocking_events": 12, "extreme_weather_linked": true}'),
      ('Saharan Air Layer', 'Dust', 'Atlantic/Sahara', 'Moderate', 'Enhanced Saharan dust transport suppressing hurricane development', '{"dust_optical_depth": 0.8, "hurricane_suppression": true, "transport_distance": "5000km"}'),
      ('Polar Vortex Disruption', 'Stratospheric', 'Arctic', 'High', 'Sudden stratospheric warming event weakening polar vortex', '{"temperature_spike": 40, "wind_reversal": true, "cold_outbreak_risk": "high"}'),
      ('Mediterranean Drought Pattern', 'Regional', 'Mediterranean', 'Critical', 'Persistent high pressure blocking rainfall across Mediterranean basin', '{"rainfall_deficit": "45%", "duration_months": 8, "agricultural_impact": "severe"}'),
      ('Atmospheric River Events', 'Precipitation', 'US West Coast', 'High', 'Series of atmospheric rivers bringing heavy rainfall to California', '{"events_count": 6, "total_precipitation": "800mm", "flooding_risk": "high"}'),
      ('Southern Annular Mode', 'SAM', 'Southern Hemisphere', 'Moderate', 'Positive SAM phase shifting westerlies poleward', '{"sam_index": 2.1, "rainfall_impact": "reduced in southern Australia", "ozone_link": true}'),
      ('Heat Dome Formation', 'Atmospheric', 'Pacific Northwest', 'Critical', 'Omega blocking pattern creating extreme heat dome conditions', '{"max_temperature": 48.5, "duration_days": 7, "mortality_risk": "extreme"}'),
      ('Tropical Easterly Jet', 'Monsoon', 'South Asia', 'Moderate', 'Strengthened TEJ enhancing Indian monsoon rainfall', '{"jet_speed": "35m/s", "monsoon_enhancement": "15%", "affected_population": "1.4B"}')
    `);
    console.log('Climate patterns seeded.');

    // 2. Weather Forecasts (15 items)
    await pool.query(`
      INSERT INTO weather_forecasts (location, forecast_date, temperature_high, temperature_low, precipitation_chance, wind_speed, humidity, conditions, description, data) VALUES
      ('New York City, NY', '2024-12-20', 8, 2, 30, 15, 65, 'Partly Cloudy', 'Cool day with some cloud cover, light winds from the northwest', '{"uv_index": 3, "visibility": "10mi", "sunrise": "07:12", "sunset": "16:33"}'),
      ('Los Angeles, CA', '2024-12-20', 22, 14, 5, 8, 45, 'Sunny', 'Clear skies with comfortable temperatures, Santa Ana winds possible', '{"uv_index": 6, "fire_risk": "moderate", "air_quality": "good"}'),
      ('Miami, FL', '2024-12-20', 28, 22, 40, 12, 78, 'Scattered Showers', 'Warm and humid with afternoon thunderstorms possible', '{"uv_index": 8, "rip_current_risk": "moderate", "heat_index": 31}'),
      ('Chicago, IL', '2024-12-20', -2, -8, 60, 25, 72, 'Snow', 'Heavy lake-effect snow expected, hazardous travel conditions', '{"snowfall_inches": 8, "wind_chill": -18, "blizzard_warning": true}'),
      ('Houston, TX', '2024-12-20', 18, 10, 20, 10, 60, 'Clear', 'Pleasant winter day with clear skies', '{"uv_index": 5, "pollen_count": "low", "dewpoint": 8}'),
      ('Phoenix, AZ', '2024-12-20', 20, 8, 0, 5, 25, 'Sunny', 'Typical dry winter day, comfortable temperatures', '{"uv_index": 5, "dust_advisory": false, "visibility": "unlimited"}'),
      ('Seattle, WA', '2024-12-20', 7, 3, 85, 18, 88, 'Rain', 'Persistent rain from atmospheric river, flooding possible in low areas', '{"rainfall_mm": 35, "flood_watch": true, "mountain_snow_level": "1200m"}'),
      ('Denver, CO', '2024-12-20', 5, -5, 15, 20, 35, 'Windy', 'Chinook winds bringing warm dry air, fire weather watch', '{"chinook_wind": true, "fire_risk": "high", "relative_humidity": "12%"}'),
      ('Boston, MA', '2024-12-20', 5, -1, 45, 22, 70, 'Cloudy', 'Overcast with possible light freezing rain overnight', '{"freezing_rain_risk": "moderate", "road_conditions": "watch", "northeaster_risk": false}'),
      ('San Francisco, CA', '2024-12-20', 15, 9, 35, 14, 72, 'Fog/Clouds', 'Morning fog clearing to partly cloudy, cool day', '{"fog_depth": "deep", "marine_layer": true, "visibility_morning": "0.25mi"}'),
      ('Dallas, TX', '2024-12-20', 15, 6, 10, 12, 50, 'Mostly Sunny', 'Mild winter day with light southerly breeze', '{"uv_index": 4, "freeze_risk_tonight": false}'),
      ('Atlanta, GA', '2024-12-20', 12, 4, 25, 8, 58, 'Partly Cloudy', 'Cool and pleasant with variable cloudiness', '{"pollen_count": "low", "air_quality": "good"}'),
      ('Minneapolis, MN', '2024-12-20', -8, -15, 40, 15, 68, 'Snow Showers', 'Bitterly cold with light snow showers, dangerous wind chills', '{"wind_chill": -28, "frostbite_risk": "10 minutes", "heating_degree_days": 35}'),
      ('Portland, OR', '2024-12-20', 8, 4, 75, 16, 85, 'Rain', 'Steady rain continuing through the day, mild for December', '{"rainfall_mm": 22, "river_levels": "rising", "landslide_risk": "moderate"}'),
      ('Anchorage, AK', '2024-12-20', -12, -20, 30, 10, 65, 'Partly Cloudy', 'Limited daylight hours, cold temperatures, aurora possible tonight', '{"daylight_hours": 5.5, "aurora_forecast": "active", "road_ice": true}')
    `);
    console.log('Weather forecasts seeded.');

    // 3. Temperature Predictions (15 items)
    await pool.query(`
      INSERT INTO temperature_predictions (region, prediction_date, predicted_temp, actual_temp, confidence, model_used, description, data) VALUES
      ('Northeast US', '2025-01-15', -5.2, -4.8, 92.5, 'LSTM Neural Network', 'Winter cold snap prediction for Northeast corridor', '{"rmse": 0.8, "mae": 0.4, "ensemble_members": 50}'),
      ('Southeast US', '2025-01-15', 12.3, 13.1, 88.0, 'GFS Ensemble', 'Mild winter conditions across Southeast', '{"rmse": 1.2, "mae": 0.8, "warm_anomaly": true}'),
      ('Midwest US', '2025-01-15', -12.5, -14.2, 85.0, 'Random Forest', 'Arctic blast pushing through Great Plains', '{"rmse": 2.1, "wind_chill_factor": true, "polar_vortex": true}'),
      ('Pacific Northwest', '2025-02-01', 8.5, 9.0, 91.0, 'Transformer Model', 'Moderate temperatures with marine influence', '{"rmse": 0.7, "marine_layer_effect": true}'),
      ('Southwest US', '2025-02-01', 18.2, 17.5, 94.0, 'CNN-LSTM Hybrid', 'Above-average warmth continuing in desert Southwest', '{"rmse": 0.9, "heat_wave_probability": 0.15}'),
      ('Northern Europe', '2025-01-20', 2.5, 1.8, 87.0, 'ECMWF Ensemble', 'Mild winter pattern over Scandinavia and UK', '{"rmse": 1.1, "nao_influence": "positive"}'),
      ('Mediterranean', '2025-02-15', 14.8, 15.2, 90.0, 'GBM Ensemble', 'Warmer than average late winter across Mediterranean basin', '{"rmse": 0.6, "anomaly_celsius": 1.5}'),
      ('South Asia', '2025-03-01', 28.5, 29.1, 86.0, 'WRF Downscaling', 'Pre-monsoon warming trend beginning across India', '{"rmse": 1.5, "heat_wave_risk": "moderate", "monsoon_onset_signal": true}'),
      ('East Asia', '2025-01-25', -2.0, -3.5, 83.0, 'DeepWeather AI', 'Cold surge from Siberian high affecting eastern China', '{"rmse": 1.8, "siberian_high_intensity": "strong"}'),
      ('Sub-Saharan Africa', '2025-02-10', 32.0, 31.5, 79.0, 'Statistical Downscaling', 'Continued heat stress across Sahel region', '{"rmse": 2.0, "heat_stress_index": "extreme"}'),
      ('South America', '2025-01-30', 30.5, 31.2, 88.5, 'LSTM Autoencoder', 'Southern hemisphere summer peak temperatures', '{"rmse": 1.0, "el_nino_influence": true}'),
      ('Australia', '2025-02-05', 38.0, 39.2, 82.0, 'ConvLSTM', 'Extreme heat event predicted for southeastern Australia', '{"rmse": 1.5, "bushfire_risk": "catastrophic", "record_breaking": true}'),
      ('Central America', '2025-03-10', 29.5, 28.8, 85.0, 'Ensemble Mean', 'Dry corridor temperatures rising ahead of wet season', '{"rmse": 1.3, "enso_phase": "neutral"}'),
      ('Arctic Region', '2025-01-10', -28.0, -25.5, 75.0, 'Polar WRF', 'Arctic temperatures well above normal, rapid ice loss signal', '{"rmse": 3.2, "anomaly_celsius": 8.5, "sea_ice_extent": "record_low"}'),
      ('Antarctic Peninsula', '2025-01-15', 2.5, 3.8, 78.0, 'CESM2', 'Unusual summer warmth on Antarctic Peninsula', '{"rmse": 2.5, "ice_shelf_stress": "critical", "melt_days": 45}')
    `);
    console.log('Temperature predictions seeded.');

    // 4. Precipitation Analysis (15 items)
    await pool.query(`
      INSERT INTO precipitation_analysis (region, analysis_period, total_rainfall, avg_rainfall, max_rainfall, drought_index, description, data) VALUES
      ('Amazon Basin', '2024 Q4', 850.5, 283.5, 120.3, 0.2, 'Below-average rainfall raising drought concerns in Amazon', '{"trend": "decreasing", "deforestation_impact": true, "river_levels": "low"}'),
      ('Sahel Region', '2024 Wet Season', 420.0, 70.0, 85.2, 1.5, 'Near-normal wet season with late onset', '{"onset_delay_days": 15, "dry_spells": 3, "crop_impact": "moderate"}'),
      ('Indian Subcontinent', '2024 Monsoon', 1150.0, 287.5, 245.0, 0.1, 'Strong monsoon season with above-average rainfall', '{"monsoon_index": 1.2, "flood_events": 8, "agricultural_benefit": true}'),
      ('US Great Plains', '2024 Annual', 520.0, 43.3, 78.5, 2.1, 'Persistent drought conditions across western Great Plains', '{"drought_category": "D2-Severe", "groundwater_decline": true, "crop_loss_pct": 25}'),
      ('Southeast Asia', '2024 Q4', 680.0, 226.7, 195.0, 0.3, 'Active monsoon trough bringing heavy rainfall', '{"typhoon_contribution": "35%", "flood_displacement": 50000, "dam_levels": "95%"}'),
      ('Mediterranean Basin', '2024 Annual', 310.0, 25.8, 65.0, 2.8, 'Severe drought year across Mediterranean region', '{"reservoir_levels": "32%", "wildfire_area_ha": 125000, "water_restrictions": true}'),
      ('East Africa', '2024 Short Rains', 280.0, 93.3, 72.0, 1.8, 'Below-average short rains season in Horn of Africa', '{"iod_influence": "negative", "pastoral_impact": "severe", "food_insecurity": true}'),
      ('Central Europe', '2024 Annual', 650.0, 54.2, 88.0, 0.8, 'Variable precipitation with summer dry spell', '{"summer_deficit": "40%", "winter_surplus": "15%", "river_navigation_impact": true}'),
      ('Northern Australia', '2024 Wet Season', 1420.0, 355.0, 310.0, 0.1, 'Above-average wet season with cyclone contributions', '{"cyclone_count": 3, "flooding_events": 5, "pastoral_recovery": true}'),
      ('Southern California', '2024 Water Year', 380.0, 31.7, 95.0, 1.2, 'Atmospheric river events providing drought relief', '{"ar_events": 8, "reservoir_fill": "78%", "snowpack": "110% normal"}'),
      ('West Africa', '2024 Annual', 950.0, 79.2, 110.0, 0.5, 'Adequate rainfall supporting agriculture across Guinea Coast', '{"growing_season_length": 180, "maize_yield_outlook": "good"}'),
      ('Andes Region', '2024 Annual', 420.0, 35.0, 92.0, 1.6, 'Reduced snowfall affecting glacier mass balance', '{"glacier_retreat_m": 45, "water_supply_risk": "moderate", "hydropower_impact": true}'),
      ('UK & Ireland', '2024 Annual', 1100.0, 91.7, 135.0, 0.0, 'Wetter than average year with frequent storm systems', '{"storm_events": 12, "flood_warnings": 85, "groundwater_recharge": "excellent"}'),
      ('Japan', '2024 Rainy Season', 720.0, 180.0, 210.0, 0.4, 'Intense Baiu season with record hourly rainfall', '{"record_hourly_mm": 110, "landslide_events": 22, "dam_overflow": 3}'),
      ('Patagonia', '2024 Annual', 180.0, 15.0, 42.0, 3.2, 'Severe drought in normally arid region worsening', '{"wind_erosion": "severe", "lake_levels": "historic_low", "livestock_loss": "30%"}')
    `);
    console.log('Precipitation analysis seeded.');

    // 5. Drought Assessments (15 items)
    await pool.query(`
      INSERT INTO drought_assessments (region, risk_level, drought_index, soil_moisture, vegetation_index, water_reserves, description, data) VALUES
      ('Central Valley, CA', 'Critical', 3.5, 12.0, 0.15, 28.0, 'Extreme drought impacting agriculture in California Central Valley', '{"crop_loss_millions": 850, "well_failures": 120, "subsidence_cm": 5}'),
      ('Texas Panhandle', 'High', 2.8, 18.0, 0.22, 35.0, 'Severe drought conditions persisting across Texas Panhandle', '{"cattle_liquidation": true, "wildfire_risk": "extreme", "dust_storms": 8}'),
      ('Horn of Africa', 'Critical', 4.0, 8.0, 0.10, 15.0, 'Multi-year drought causing humanitarian crisis', '{"people_affected_millions": 23, "livestock_deaths_millions": 7, "aid_needed": true}'),
      ('Iberian Peninsula', 'High', 3.0, 15.0, 0.18, 32.0, 'Prolonged drought affecting Spain and Portugal', '{"reservoir_pct": 30, "desalination_increase": "40%", "olive_yield_loss": "60%"}'),
      ('Murray-Darling Basin', 'Moderate', 2.0, 25.0, 0.30, 45.0, 'Developing drought in Australia key agricultural basin', '{"water_allocation_cut": "30%", "cotton_planting_reduced": true}'),
      ('North China Plain', 'High', 2.5, 20.0, 0.25, 38.0, 'Winter wheat belt facing significant moisture deficit', '{"wheat_risk_pct": 35, "groundwater_decline_m": 2, "irrigation_demand": "critical"}'),
      ('Sahel Belt', 'Critical', 3.8, 10.0, 0.12, 18.0, 'Advancing desertification across Sahel region', '{"desertification_km2": 5000, "migration_thousands": 150, "great_green_wall_progress": "12%"}'),
      ('Southern Brazil', 'Moderate', 1.8, 28.0, 0.35, 50.0, 'La Niña-driven drought affecting soybean production', '{"soy_loss_pct": 20, "hydropower_reduction": "25%", "parana_river_level": "low"}'),
      ('East Mediterranean', 'High', 3.2, 14.0, 0.16, 25.0, 'Record drought across Syria, Jordan, Iraq', '{"wheat_production_drop": "40%", "water_conflict_risk": "high", "displacement": true}'),
      ('Great Basin, US', 'High', 2.6, 16.0, 0.20, 30.0, 'Lake levels at historic lows across Great Basin', '{"great_salt_lake_pct": 45, "dust_exposure_risk": true, "arsenic_exposure": true}'),
      ('Rajasthan, India', 'Critical', 3.6, 9.0, 0.11, 20.0, 'Thar Desert expansion threatening agricultural lands', '{"village_evacuations": 35, "canal_water_cut": "50%", "livestock_migration": true}'),
      ('Rift Valley, Kenya', 'Moderate', 2.2, 22.0, 0.28, 40.0, 'Below-normal short rains impacting pastoralists', '{"livestock_condition": "poor", "market_prices": "200% above normal", "water_trucking": true}'),
      ('Colorado Basin', 'High', 2.9, 17.0, 0.21, 33.0, 'Lake Mead and Lake Powell at critically low levels', '{"lake_mead_pct": 28, "tier_2_shortage": true, "hydropower_risk": true}'),
      ('Southern Madagascar', 'Critical', 4.2, 6.0, 0.08, 10.0, 'Worst drought in 40 years causing famine conditions', '{"famine_risk": "IPC Phase 4", "people_food_insecure": 1300000, "aid_gap_pct": 60}'),
      ('Andalusia, Spain', 'High', 3.1, 13.0, 0.17, 27.0, 'Olive oil production crisis due to multi-year drought', '{"olive_oil_price_increase": "120%", "farm_abandonment": true, "tourism_water_conflict": true}')
    `);
    console.log('Drought assessments seeded.');

    // 6. Flood Predictions (15 items)
    await pool.query(`
      INSERT INTO flood_predictions (region, risk_level, river_level, rainfall_forecast, soil_saturation, population_affected, description, data) VALUES
      ('Bangladesh Delta', 'Critical', 12.5, 320.0, 95.0, 2500000, 'Monsoon flooding threatening Ganges-Brahmaputra delta', '{"river_system": "Ganges-Brahmaputra", "levee_risk": "high", "evacuation_ordered": true}'),
      ('Mississippi River Basin', 'High', 14.2, 180.0, 82.0, 450000, 'Spring melt combined with heavy rain creating major flood risk', '{"crest_date": "2025-04-15", "levee_system": "stressed", "navigation_closed": true}'),
      ('Rhine Valley, Germany', 'Moderate', 8.8, 95.0, 70.0, 180000, 'Sustained rainfall raising Rhine to warning levels', '{"shipping_impact": true, "flood_barriers_deployed": 12, "insurance_claims": 5000}'),
      ('Kerala, India', 'High', 6.5, 280.0, 90.0, 800000, 'Extreme monsoon rainfall causing widespread flooding', '{"landslides": 45, "dam_releases": 8, "relief_camps": 200}'),
      ('Po Valley, Italy', 'Moderate', 7.2, 110.0, 75.0, 120000, 'Autumn storms bringing flood risk to northern Italy', '{"agricultural_area_flooded_ha": 15000, "infrastructure_damage": "moderate"}'),
      ('Mekong Delta, Vietnam', 'High', 10.8, 250.0, 88.0, 1800000, 'Peak flood season with upstream dam releases', '{"rice_paddies_flooded_pct": 40, "aquaculture_loss": true, "saltwater_intrusion": true}'),
      ('UK Somerset Levels', 'Moderate', 5.5, 85.0, 78.0, 25000, 'Persistent rain causing river levels to rise in low-lying areas', '{"pump_stations_active": 15, "road_closures": 30, "livestock_moved": true}'),
      ('Jakarta, Indonesia', 'Critical', 4.2, 200.0, 92.0, 3000000, 'Seasonal flooding compounded by land subsidence', '{"subsidence_rate_cm_yr": 10, "pump_capacity_exceeded": true, "clean_water_disrupted": true}'),
      ('Yangtze River, China', 'High', 15.5, 220.0, 85.0, 5000000, 'Three Gorges Dam managing record inflows', '{"three_gorges_inflow": "record", "downstream_flooding": true, "economic_loss_billions": 15}'),
      ('Danube Basin', 'Moderate', 9.0, 100.0, 72.0, 200000, 'Spring snowmelt and rainfall creating flood conditions', '{"countries_affected": 5, "flood_defense_status": "activated", "dam_coordination": true}'),
      ('Pakistan Indus Valley', 'Critical', 11.0, 300.0, 93.0, 4000000, 'Glacial melt and monsoon creating catastrophic flooding', '{"glacier_lake_outbursts": 3, "bridges_destroyed": 45, "crop_loss_pct": 60}'),
      ('Amazon Floodplain', 'Moderate', 16.0, 180.0, 80.0, 350000, 'Annual flood pulse exceeding normal levels', '{"flood_extent_km2": 350000, "varzea_impact": true, "navigation_enhanced": true}'),
      ('Nile Delta, Egypt', 'Low', 3.5, 45.0, 55.0, 80000, 'Aswan High Dam controlling flow, minimal flood risk', '{"dam_storage_pct": 88, "seawater_intrusion_risk": true, "delta_erosion": true}'),
      ('Missouri River Basin', 'High', 13.0, 150.0, 80.0, 300000, 'Heavy spring rainfall exceeding dam capacity', '{"dam_releases_increased": true, "levee_overwash_risk": "moderate", "crop_planting_delayed": true}'),
      ('Brisbane, Australia', 'Moderate', 8.0, 160.0, 76.0, 150000, 'La Niña-driven flooding risk for southeast Queensland', '{"dam_level_pct": 95, "pre_release_underway": true, "2011_flood_comparison": "lower"}')
    `);
    console.log('Flood predictions seeded.');

    // 7. Storm Tracking (15 items)
    await pool.query(`
      INSERT INTO storm_tracking (storm_name, storm_type, category, current_location, wind_speed, pressure, direction, description, data) VALUES
      ('Hurricane Maria', 'Hurricane', 'Category 4', '18.5°N 65.2°W', 250, 940, 'NW at 15 mph', 'Major hurricane threatening Caribbean islands', '{"eye_diameter_km": 35, "storm_surge_m": 4.5, "rainfall_forecast_mm": 500}'),
      ('Typhoon Haiyan II', 'Typhoon', 'Super Typhoon', '12.8°N 132.5°E', 315, 895, 'WNW at 20 mph', 'Extremely powerful typhoon approaching Philippines', '{"jtwc_category": 5, "wave_height_m": 15, "evacuation_millions": 2.5}'),
      ('Cyclone Amphan', 'Cyclone', 'Very Severe', '16.2°N 88.5°E', 240, 920, 'N at 12 mph', 'Intense cyclone in Bay of Bengal heading toward Bangladesh', '{"storm_surge_m": 5, "coastal_evacuation": true, "infrastructure_risk": "extreme"}'),
      ('Storm Eunice', 'Extratropical', 'Severe', '51.5°N 2.0°W', 195, 960, 'ENE at 45 mph', 'Powerful windstorm affecting UK and Northern Europe', '{"red_warnings": 3, "flight_cancellations": 400, "power_outages": 1200000}'),
      ('Tropical Storm Alex', 'Tropical Storm', 'TS', '25.0°N 78.0°W', 100, 998, 'NE at 18 mph', 'Early season tropical storm in western Atlantic', '{"development_probability": 40, "rainfall_focus": "Bahamas", "wave_advisory": true}'),
      ('Hurricane Delta', 'Hurricane', 'Category 3', '20.5°N 92.0°W', 200, 953, 'NNW at 14 mph', 'Major hurricane in Gulf of Mexico targeting Louisiana coast', '{"oil_platform_evacuations": 30, "storm_surge_m": 3, "tornado_risk": true}'),
      ('Typhoon Mangkhut', 'Typhoon', 'Category 5', '16.0°N 126.5°E', 285, 905, 'WNW at 17 mph', 'Monster typhoon crossing northern Philippines toward Hong Kong', '{"diameter_km": 900, "mining_region_impact": true, "landslide_risk": "extreme"}'),
      ('Medicane Apollo', 'Medicane', 'Category 1', '36.5°N 16.0°E', 130, 985, 'SW at 8 mph', 'Rare Mediterranean hurricane near Sicily', '{"unusual_formation": true, "sea_surface_temp": 28, "climate_change_link": true}'),
      ('Derecho Event', 'Derecho', 'Severe', '42.0°N 90.0°W', 160, 990, 'E at 55 mph', 'Powerful derecho crossing upper Midwest with extreme winds', '{"damage_swath_km": 1200, "crops_destroyed_ha": 400000, "power_outage_days": 7}'),
      ('Bomb Cyclone NorPac', 'Extratropical', 'Extreme', '45.0°N 165.0°W', 175, 940, 'NE at 40 mph', 'Explosive cyclogenesis creating monster North Pacific storm', '{"pressure_drop_24h": 50, "wave_height_m": 20, "shipping_alerts": true}'),
      ('Tropical Cyclone Freddy', 'Cyclone', 'Category 3', '15.0°S 50.0°E', 210, 945, 'WSW at 10 mph', 'Record-breaking long-lived tropical cyclone in Indian Ocean', '{"duration_days": 36, "record_ace": true, "countries_affected": 4}'),
      ('Hurricane Otis', 'Hurricane', 'Category 5', '16.8°N 100.0°W', 270, 923, 'NNE at 8 mph', 'Rapidly intensifying hurricane near Acapulco, Mexico', '{"intensification_mph_24h": 115, "rapid_intensification": true, "forecast_error": "extreme"}'),
      ('Winter Storm Elliott', 'Winter Storm', 'Extreme', '40.0°N 82.0°W', 105, 970, 'NE at 30 mph', 'Bomb cyclone bringing blizzard conditions to eastern US', '{"temperature_drop_f": 40, "wind_chill_f": -45, "deaths": 60}'),
      ('Tornado Outbreak', 'Tornado', 'EF4-EF5', '35.0°N 87.0°W', 320, 980, 'NE at 50 mph', 'Multi-day severe tornado outbreak across Southeast US', '{"tornado_count": 85, "ef5_count": 3, "damage_path_total_km": 600}'),
      ('Cyclone Gabrielle', 'Cyclone', 'Category 2', '35.0°S 178.0°E', 175, 955, 'SSE at 15 mph', 'Powerful ex-tropical cyclone devastating New Zealand North Island', '{"flooding_unprecedented": true, "landslides": 200, "agricultural_loss_billions": 1.5}')
    `);
    console.log('Storm tracking seeded.');

    // 8. Sea Level Projections (15 items)
    await pool.query(`
      INSERT INTO sea_level_projections (coastal_region, current_level, projected_rise, projection_year, confidence, impact_assessment, description, data) VALUES
      ('Miami-Dade County, FL', 0.15, 0.60, 2050, 85.0, 'Severe flooding of low-lying neighborhoods, saltwater intrusion into aquifer', 'Critical infrastructure at risk including airports and water treatment', '{"population_at_risk": 800000, "property_value_billions": 120, "adaptation_cost_billions": 25}'),
      ('New York City Metro', 0.12, 0.45, 2050, 88.0, 'Subway system flooding, coastal erosion of beaches and wetlands', 'Major investment needed in coastal barriers and infrastructure resilience', '{"subway_stations_at_risk": 37, "housing_units_affected": 71000, "seawall_cost_billions": 10}'),
      ('Shanghai, China', 0.18, 0.55, 2050, 82.0, 'Massive population displacement risk, port infrastructure damage', 'Land subsidence compounding sea level rise effects', '{"subsidence_mm_yr": 6, "population_at_risk_millions": 17, "gdp_at_risk_billions": 450}'),
      ('Mumbai, India', 0.14, 0.50, 2050, 80.0, 'Slum areas highly vulnerable, drainage system overwhelmed', 'Monsoon flooding amplified by rising sea levels', '{"slum_population_at_risk_millions": 4, "mangrove_loss_pct": 40, "flood_days_increase": 25}'),
      ('Netherlands Coast', 0.10, 0.40, 2050, 90.0, 'Existing defenses adequate but need upgrade for higher scenarios', 'World-leading flood defense system requiring continuous investment', '{"delta_works_upgrade_billions": 15, "land_below_sea_level_pct": 26, "defense_reliability": "1:10000"}'),
      ('Pacific Islands (Tuvalu)', 0.20, 0.70, 2050, 78.0, 'Existential threat to island nation, complete inundation possible', 'Climate refugee crisis imminent, sovereignty questions', '{"max_elevation_m": 4.6, "habitable_land_loss_pct": 50, "population_relocation": true}'),
      ('Bangladesh Coast', 0.16, 0.55, 2050, 83.0, 'Millions displaced, agricultural land lost to saltwater', 'Delta region highly vulnerable to combined river and sea flooding', '{"land_loss_km2": 17000, "people_displaced_millions": 20, "rice_production_loss_pct": 30}'),
      ('Jakarta, Indonesia', 0.25, 0.80, 2050, 76.0, 'Rapid subsidence amplifying sea level rise effects dramatically', 'Capital relocation to Nusantara already underway', '{"subsidence_cm_yr": 10, "seawall_height_gap": "critical", "capital_relocation_cost_billions": 35}'),
      ('Venice, Italy', 0.08, 0.35, 2050, 92.0, 'MOSE barriers activated more frequently, cultural heritage at risk', 'Iconic city adapting with mobile barriers and elevated walkways', '{"mose_activations_per_year": 40, "acqua_alta_days_increase": 100, "tourism_impact_pct": 15}'),
      ('San Francisco Bay', 0.11, 0.42, 2050, 87.0, 'Airport and shoreline infrastructure flooding, wetland loss', 'Tech corridor along bay vulnerable to chronic flooding', '{"sfo_runway_risk": true, "bay_wetland_loss_pct": 60, "highway_flooding_km": 45}'),
      ('Tokyo Bay', 0.09, 0.38, 2050, 89.0, 'Zero-meter zone expansion, typhoon storm surge amplification', 'Advanced infrastructure but aging seawalls need replacement', '{"zero_meter_zone_expansion_km2": 150, "seawall_rebuild_cost_billions": 20}'),
      ('London Thames Estuary', 0.07, 0.35, 2050, 91.0, 'Thames Barrier closure frequency increasing, need for new barrier', 'Planning underway for Thames Estuary 2100 project', '{"barrier_closures_per_year": 12, "new_barrier_cost_billions": 8, "protected_value_billions": 275}'),
      ('Maldives', 0.22, 0.75, 2050, 77.0, 'National survival at stake, 80% of land less than 1m above sea level', 'Floating city concepts and land reclamation as adaptation', '{"islands_inhabited": 187, "artificial_island_projects": 5, "relocation_agreements": 3}'),
      ('Lagos, Nigeria', 0.19, 0.65, 2050, 75.0, 'Rapid urbanization in flood-prone areas amplifying risk', 'Megacity with limited coastal defenses and growing population', '{"population_millions": 21, "informal_settlements_at_risk_pct": 70, "annual_flood_damage_millions": 500}'),
      ('New Orleans, LA', 0.20, 0.58, 2050, 84.0, 'Levee system stress increasing, pump capacity concerns', 'Post-Katrina defenses being tested by accelerating rise', '{"levee_miles": 350, "pump_stations": 120, "hurricane_surge_amplification_pct": 25}')
    `);
    console.log('Sea level projections seeded.');

    // 9. Air Quality (15 items)
    await pool.query(`
      INSERT INTO air_quality (location, aqi_value, pm25, pm10, ozone, co_level, category, description, data) VALUES
      ('Beijing, China', 185, 135.0, 220.0, 45.0, 1.8, 'Unhealthy', 'Winter heating season causing elevated pollution levels', '{"dominant_pollutant": "PM2.5", "visibility_km": 3, "health_advisory": "sensitive groups stay indoors"}'),
      ('Delhi, India', 320, 280.0, 350.0, 35.0, 2.5, 'Hazardous', 'Post-Diwali and crop burning creating severe smog', '{"dominant_pollutant": "PM2.5", "visibility_km": 0.5, "school_closures": true, "flight_diversions": 15}'),
      ('Los Angeles, CA', 95, 22.0, 45.0, 82.0, 0.8, 'Moderate', 'Ozone levels elevated due to temperature inversion and traffic', '{"dominant_pollutant": "O3", "inversion_layer": true, "smog_alert": false}'),
      ('London, UK', 65, 15.0, 30.0, 55.0, 0.6, 'Moderate', 'Winter pollution episode with stagnant air', '{"dominant_pollutant": "NO2", "ulez_impact": "positive", "wood_burning_advisory": true}'),
      ('Sydney, Australia', 280, 200.0, 310.0, 40.0, 3.2, 'Very Unhealthy', 'Bushfire smoke blanketing greater Sydney area', '{"dominant_pollutant": "PM2.5", "fire_source_km": 50, "mask_advisory": true, "outdoor_events_cancelled": true}'),
      ('Tokyo, Japan', 45, 12.0, 25.0, 40.0, 0.4, 'Good', 'Clean air conditions with sea breeze circulation', '{"dominant_pollutant": "PM2.5", "pollen_count": "high", "transboundary_pollution": false}'),
      ('Mexico City, Mexico', 155, 65.0, 120.0, 95.0, 1.5, 'Unhealthy', 'Thermal inversion trapping pollutants in valley', '{"dominant_pollutant": "O3", "altitude_factor": true, "hoy_no_circula": "phase_2", "visibility_km": 5}'),
      ('Cairo, Egypt', 175, 90.0, 180.0, 50.0, 1.2, 'Unhealthy', 'Desert dust and vehicle emissions creating poor air quality', '{"dominant_pollutant": "PM10", "dust_storm": false, "open_burning": true}'),
      ('Stockholm, Sweden', 25, 6.0, 12.0, 30.0, 0.2, 'Good', 'Clean Nordic air with effective emission controls', '{"dominant_pollutant": "PM10", "winter_studded_tires_impact": true, "green_zones": true}'),
      ('Lagos, Nigeria', 195, 110.0, 190.0, 55.0, 2.0, 'Unhealthy', 'Generator emissions and traffic contributing to poor air quality', '{"dominant_pollutant": "PM2.5", "generator_contribution_pct": 30, "industrial_zone_impact": true}'),
      ('São Paulo, Brazil', 85, 20.0, 40.0, 65.0, 0.7, 'Moderate', 'Dry season biomass burning affecting air quality', '{"dominant_pollutant": "O3", "fire_season": true, "vehicle_fleet_age": "improving"}'),
      ('Singapore', 110, 40.0, 70.0, 50.0, 0.5, 'Unhealthy for Sensitive', 'Transboundary haze from Indonesian palm oil fires', '{"dominant_pollutant": "PM2.5", "haze_source": "Sumatra", "psi_3hr": 130, "visibility_km": 4}'),
      ('Denver, CO', 75, 18.0, 35.0, 72.0, 0.6, 'Moderate', 'Brown cloud from temperature inversion and wildfire smoke', '{"dominant_pollutant": "O3", "altitude_uv": "high", "wildfire_smoke": true}'),
      ('Dhaka, Bangladesh', 210, 150.0, 250.0, 40.0, 2.2, 'Very Unhealthy', 'Brick kiln emissions and construction dust creating toxic air', '{"dominant_pollutant": "PM2.5", "brick_kilns_nearby": 1200, "construction_dust": true}'),
      ('Vancouver, Canada', 160, 80.0, 100.0, 45.0, 1.0, 'Unhealthy', 'Wildfire smoke from BC interior fires creating health emergency', '{"dominant_pollutant": "PM2.5", "fire_count": 500, "smoke_forecast_days": 5, "mask_distribution": true}')
    `);
    console.log('Air quality seeded.');

    // 10. Carbon Emissions (15 items)
    await pool.query(`
      INSERT INTO carbon_emissions (source, emission_type, amount_tons, measurement_date, sector, reduction_target, description, data) VALUES
      ('US Power Grid', 'CO2', 1750000000, '2024-01-01', 'Energy', 50.0, 'Total US electricity generation carbon emissions', '{"coal_pct": 20, "gas_pct": 40, "renewable_pct": 22, "nuclear_pct": 18}'),
      ('China Steel Industry', 'CO2', 1800000000, '2024-01-01', 'Industry', 30.0, 'Chinese steel production remains largest industrial emitter', '{"production_mt": 1000, "efficiency_improvement": "3% YoY", "hydrogen_pilot": true}'),
      ('Global Aviation', 'CO2', 920000000, '2024-01-01', 'Transport', 25.0, 'Commercial aviation emissions rebounding post-pandemic', '{"saf_adoption_pct": 1.5, "fleet_efficiency_gain": "2%", "offset_programs": true}'),
      ('EU Agriculture', 'CH4', 420000000, '2024-01-01', 'Agriculture', 35.0, 'Methane from livestock and rice cultivation across EU', '{"livestock_contribution": "70%", "rice_paddies": "15%", "manure_management": "15%"}'),
      ('India Cement Industry', 'CO2', 340000000, '2024-01-01', 'Industry', 20.0, 'Rapid infrastructure development driving cement emissions', '{"production_growth": "8%", "alternative_fuels_pct": 5, "clinker_ratio": 0.7}'),
      ('Amazon Deforestation', 'CO2', 500000000, '2024-01-01', 'Land Use', 80.0, 'Carbon release from ongoing Amazon rainforest clearing', '{"hectares_cleared": 1100000, "fire_contribution": "60%", "carbon_sink_loss": true}'),
      ('Global Shipping', 'CO2', 750000000, '2024-01-01', 'Transport', 40.0, 'Maritime shipping transitioning to cleaner fuels', '{"lng_adoption_pct": 8, "speed_reduction_savings": "12%", "imo_compliance": "improving"}'),
      ('Russian Gas Flaring', 'CO2', 180000000, '2024-01-01', 'Energy', 50.0, 'Routine gas flaring at oil extraction sites', '{"flaring_volume_bcm": 25, "satellite_monitoring": true, "methane_leakage": "significant"}'),
      ('US Transport Sector', 'CO2', 1900000000, '2024-01-01', 'Transport', 45.0, 'Largest US emission sector, EV adoption accelerating', '{"ev_market_share": "9%", "fleet_avg_mpg": 25.4, "ev_savings_mt": 50}'),
      ('Global Data Centers', 'CO2', 200000000, '2024-01-01', 'Technology', 55.0, 'AI boom driving rapid data center energy consumption', '{"ai_contribution_pct": 25, "renewable_powered_pct": 40, "pue_average": 1.3}'),
      ('Indonesia Peatland Fires', 'CO2', 600000000, '2024-01-01', 'Land Use', 70.0, 'Peat fires releasing centuries of stored carbon', '{"fire_season_months": 4, "haze_affected_countries": 5, "restoration_ha": 200000}'),
      ('EU Building Heating', 'CO2', 550000000, '2024-01-01', 'Buildings', 60.0, 'Fossil fuel heating in European buildings', '{"heat_pump_adoption": "15%", "gas_boiler_ban_2030": true, "retrofit_rate_pct": 1.2}'),
      ('Australian Mining', 'CO2', 280000000, '2024-01-01', 'Industry', 35.0, 'Coal and mineral mining fugitive emissions', '{"coal_mine_methane": "45%", "diesel_equipment": "30%", "electrification_pilot": true}'),
      ('Japan Manufacturing', 'CO2', 350000000, '2024-01-01', 'Industry', 46.0, 'Heavy industry emissions including automotive manufacturing', '{"hydrogen_strategy": true, "nuclear_restart": "progressing", "carbon_pricing": "pilot"}'),
      ('Global Waste Sector', 'CH4', 400000000, '2024-01-01', 'Waste', 45.0, 'Landfill methane and wastewater treatment emissions', '{"landfill_gas_capture": "30%", "composting_growth": "8%", "circular_economy_impact": true}')
    `);
    console.log('Carbon emissions seeded.');

    // 11. Crop Yield Predictions (15 items)
    await pool.query(`
      INSERT INTO crop_yield_predictions (crop_name, region, predicted_yield, unit, season, climate_impact, description, data) VALUES
      ('Wheat', 'US Great Plains', 3.2, 'tons/hectare', 'Winter 2024-25', 'Moderate Drought Stress', 'Below-average yields expected due to persistent drought', '{"irrigation_pct": 35, "variety": "hard red winter", "price_forecast": "$7.50/bu"}'),
      ('Rice', 'Mekong Delta, Vietnam', 6.8, 'tons/hectare', 'Summer 2025', 'Saltwater Intrusion', 'Sea level rise causing saltwater intrusion reducing yields', '{"salt_tolerance_varieties": true, "affected_area_pct": 25, "export_impact": "moderate"}'),
      ('Corn', 'Iowa, US', 11.5, 'tons/hectare', 'Summer 2025', 'Favorable', 'Optimal growing conditions predicted for Midwest corn belt', '{"planting_date": "optimal", "gdd_forecast": "above_normal", "ethanol_demand": "strong"}'),
      ('Soybeans', 'Mato Grosso, Brazil', 3.5, 'tons/hectare', 'Summer 2025', 'La Niña Stress', 'Reduced rainfall from La Niña threatening soybean crop', '{"deforestation_pressure": true, "china_demand": "strong", "price_volatility": "high"}'),
      ('Coffee', 'Minas Gerais, Brazil', 2.8, 'tons/hectare', 'Annual 2025', 'Heat Stress', 'Rising temperatures pushing coffee cultivation to higher altitudes', '{"altitude_shift_m": 200, "arabica_loss_pct": 15, "global_price_impact": true}'),
      ('Cocoa', 'Côte d''Ivoire', 0.5, 'tons/hectare', 'Main Crop 2025', 'Excessive Rain', 'Heavy rains increasing black pod disease risk', '{"disease_pressure": "high", "production_forecast_mt": 2200000, "price_record": true}'),
      ('Olive Oil', 'Andalusia, Spain', 1.2, 'tons/hectare', 'Annual 2025', 'Severe Drought', 'Multi-year drought devastating olive production', '{"production_drop_pct": 50, "price_increase_pct": 120, "irrigation_restrictions": true}'),
      ('Cotton', 'Punjab, Pakistan', 0.7, 'tons/hectare', 'Kharif 2025', 'Flood Recovery', 'Post-flood soil conditions affecting cotton quality and yield', '{"soil_salinity": "elevated", "pest_pressure": "high", "textile_industry_impact": true}'),
      ('Grapes', 'Napa Valley, CA', 8.0, 'tons/hectare', 'Harvest 2025', 'Wildfire Smoke', 'Smoke taint risk from increasing wildfire activity', '{"smoke_days": 15, "taint_risk": "moderate", "crop_insurance_claims": "rising"}'),
      ('Maize', 'East Africa', 1.5, 'tons/hectare', 'Long Rains 2025', 'Drought', 'Below-average rains threatening food security in East Africa', '{"food_insecurity_millions": 12, "import_dependency": "increasing", "relief_aid_needed": true}'),
      ('Sugarcane', 'São Paulo, Brazil', 80.0, 'tons/hectare', 'Annual 2025', 'Mixed', 'Adequate rainfall but frost risk in southern growing areas', '{"ethanol_production_pct": 55, "frost_events": 2, "global_sugar_price_impact": true}'),
      ('Avocado', 'Michoacán, Mexico', 10.0, 'tons/hectare', 'Annual 2025', 'Water Stress', 'Aquifer depletion threatening largest avocado producing region', '{"water_table_decline_m": 3, "illegal_orchard_expansion": true, "us_demand_growth": "12%"}'),
      ('Tea', 'Assam, India', 2.2, 'tons/hectare', 'Annual 2025', 'Erratic Monsoon', 'Changing monsoon patterns affecting tea quality and quantity', '{"flush_timing_shift_days": 10, "quality_premium_change": "-8%", "labor_shortage": true}'),
      ('Potatoes', 'Idaho, US', 45.0, 'tons/hectare', 'Fall 2025', 'Favorable', 'Good irrigation water availability supporting strong yields', '{"irrigation_reservoir": "85%", "processing_demand": "strong", "export_market": "growing"}'),
      ('Almonds', 'Central Valley, CA', 2.5, 'tons/hectare', 'Annual 2025', 'Water Restrictions', 'Mandatory water curtailments reducing orchard irrigation', '{"water_allocation_pct": 40, "tree_removal_acres": 15000, "pollination_success": "moderate"}')
    `);
    console.log('Crop yield predictions seeded.');

    // 12. Insurance Risk (15 items)
    await pool.query(`
      INSERT INTO insurance_risk (property_type, location, risk_score, climate_risk_factor, premium_adjustment, coverage_recommendation, description, data) VALUES
      ('Residential', 'Miami Beach, FL', 9.2, 'Sea Level Rise + Hurricane', 45.0, 'Require flood insurance, wind mitigation credits', 'Extreme risk coastal property in hurricane zone with rising seas', '{"flood_zone": "AE", "base_flood_elevation_ft": 7, "hurricane_return_period_yr": 8}'),
      ('Commercial', 'Houston, TX', 7.8, 'Flooding + Heat', 30.0, 'Business interruption coverage essential, flood endorsement', 'Major flood risk from tropical systems and urban drainage', '{"harvey_loss_millions": 125, "heat_days_above_100": 45, "power_grid_risk": true}'),
      ('Agricultural', 'Central Valley, CA', 8.5, 'Drought + Wildfire', 40.0, 'Crop insurance with drought rider, fire coverage for structures', 'Critical drought and wildfire risk for agricultural operations', '{"drought_frequency": "3 in 5 years", "wildfire_proximity_mi": 15, "water_rights_risk": true}'),
      ('Residential', 'Paradise, CA', 9.5, 'Wildfire', 65.0, 'High-risk fire zone, ember-resistant construction required', 'Extreme wildfire risk zone, Camp Fire destroyed 95% of town', '{"fire_history_events": 3, "vegetation_type": "chaparral", "defensible_space_required": true}'),
      ('Industrial', 'New Orleans, LA', 8.0, 'Hurricane + Flood', 35.0, 'Comprehensive flood and wind coverage, backup power required', 'Below sea level industrial zone behind levee system', '{"levee_dependent": true, "katrina_loss_millions": 80, "pump_station_proximity": "0.5mi"}'),
      ('Residential', 'Outer Banks, NC', 8.8, 'Hurricane + Erosion', 50.0, 'Required flood insurance, erosion setback compliance', 'Barrier island property with active erosion and storm exposure', '{"erosion_rate_ft_yr": 4, "beach_nourishment_cycle_yr": 5, "nor_easter_frequency": 3}'),
      ('Commercial', 'Phoenix, AZ', 6.5, 'Extreme Heat', 20.0, 'Heat-related liability coverage, HVAC failure insurance', 'Extreme heat risk affecting worker safety and infrastructure', '{"days_above_110f": 30, "urban_heat_island_add": 5, "cooling_cost_increase_pct": 40}'),
      ('Residential', 'Malibu, CA', 9.0, 'Wildfire + Landslide', 55.0, 'Combined fire and earth movement coverage required', 'Dual risk from wildfire and post-fire debris flows', '{"fire_risk_score": 95, "slope_angle_degrees": 35, "burn_scar_flood_risk": true}'),
      ('Agricultural', 'Iowa Farmland', 5.5, 'Flooding + Drought', 15.0, 'Standard crop insurance with revenue protection', 'Variable climate risk with both flood and drought possible', '{"crop_insurance_participation": "85%", "prevented_planting_frequency": "1 in 7"}'),
      ('Commercial', 'Manhattan, NY', 7.0, 'Storm Surge + Infrastructure', 25.0, 'Flood coverage for below-grade, business continuity plan', 'Coastal storm surge risk for high-value commercial district', '{"sandy_loss_billions": 19, "subway_flood_risk": true, "backup_generator_required": true}'),
      ('Residential', 'Key West, FL', 9.4, 'Hurricane + Sea Level', 60.0, 'Maximum wind and flood coverage, elevation certificate required', 'Low-lying island extremely vulnerable to hurricanes and sea level rise', '{"max_elevation_ft": 18, "hurricane_frequency_5yr": 2, "insurance_availability": "limited"}'),
      ('Industrial', 'Galveston, TX', 8.2, 'Hurricane + Chemical', 38.0, 'Pollution liability, windstorm coverage, business interruption', 'Petrochemical corridor with hurricane and pollution risk', '{"chemical_facilities_nearby": 12, "storm_surge_ft": 15, "evacuation_route_limited": true}'),
      ('Residential', 'Lake Tahoe, CA', 7.5, 'Wildfire', 35.0, 'Wildfire coverage with extended replacement cost', 'WUI zone with increasing fire risk from drought and bark beetle', '{"wui_classification": "intermix", "beetle_kill_pct": 20, "evacuation_routes": 2}'),
      ('Commercial', 'San Juan, PR', 8.5, 'Hurricane + Grid Failure', 42.0, 'Generator coverage, extended business interruption, wind coverage', 'Vulnerable island infrastructure with fragile power grid', '{"maria_loss_millions": 200, "power_outage_days_avg": 180, "grid_modernization": "in_progress"}'),
      ('Agricultural', 'Yakima Valley, WA', 6.0, 'Drought + Frost', 18.0, 'Crop insurance with frost protection rider', 'Premium fruit growing region facing water scarcity and late frost risk', '{"frost_events_spring": 3, "irrigation_water_allocation": "70%", "apple_production_value_millions": 500}')
    `);
    console.log('Insurance risk seeded.');

    // 13. Real Estate Climate Risk (15 items)
    await pool.query(`
      INSERT INTO real_estate_climate_risk (property_address, city, risk_score, flood_risk, fire_risk, heat_risk, projected_impact, description, data) VALUES
      ('123 Ocean Drive', 'Miami Beach, FL', 9.5, 'Extreme', 'Low', 'High', 'Property likely to experience regular tidal flooding by 2035', 'Luxury waterfront property at critical sea level rise risk', '{"value_millions": 8.5, "elevation_ft": 4, "tidal_flood_days_2030": 60, "insurance_cost_annual": 45000}'),
      ('456 Hilltop Road', 'Malibu, CA', 8.8, 'Low', 'Extreme', 'Moderate', 'Wildfire risk increasing 15% per decade, mandatory evacuation zone', 'Hillside property in very high fire hazard severity zone', '{"value_millions": 12.0, "fire_history_5mi": 3, "insurance_available": false, "defensible_space": "partial"}'),
      ('789 River View Lane', 'Houston, TX', 7.5, 'High', 'Low', 'High', 'Flooding frequency expected to double by 2040', 'Residential property in expanding 100-year floodplain', '{"value_millions": 0.45, "flood_events_10yr": 3, "harvey_damage": 85000, "buyout_eligible": true}'),
      ('321 Seaside Ave', 'Charleston, SC', 8.2, 'Extreme', 'Low', 'Moderate', 'Historic district facing chronic flooding and foundation damage', 'Historic property with compound sea level and rainfall flood risk', '{"value_millions": 1.8, "historic_designation": true, "flood_events_annual": 15, "foundation_damage": true}'),
      ('654 Desert Springs Dr', 'Phoenix, AZ', 6.5, 'Low', 'Low', 'Extreme', 'Cooling costs projected to increase 60% by 2050, water restrictions likely', 'Suburban property in extreme heat zone with water scarcity', '{"value_millions": 0.55, "days_above_110f_2050": 60, "water_source": "CAP allocation", "solar_panels": true}'),
      ('987 Pine Forest Trail', 'Lake Tahoe, NV', 7.8, 'Low', 'High', 'Low', 'WUI fire risk increasing, insurance becoming unavailable', 'Mountain retreat in wildland-urban interface zone', '{"value_millions": 2.2, "tree_mortality_pct": 25, "fire_breaks": false, "insurance_non_renewal": true}'),
      ('147 Coastal Highway', 'Norfolk, VA', 8.0, 'Extreme', 'Low', 'Moderate', 'Military base proximity, area experiencing rapid relative sea level rise', 'Coastal property near Naval Station Norfolk with subsidence issues', '{"value_millions": 0.38, "subsidence_mm_yr": 3, "flood_insurance_cost": 12000, "road_flooding_days": 30}'),
      ('258 Bayou Circle', 'New Orleans, LA', 8.5, 'Extreme', 'Low', 'High', 'Below sea level, levee-dependent, pump system critical', 'French Quarter adjacent property behind federal levee system', '{"value_millions": 0.65, "elevation_ft": -3, "levee_certification": true, "pump_station_distance_mi": 0.3}'),
      ('369 Vineyard Way', 'Napa, CA', 7.2, 'Low', 'High', 'Moderate', 'Smoke taint risk reducing vineyard value, drought water concerns', 'Premium vineyard property facing compound fire and drought risk', '{"value_millions": 5.5, "vineyard_acres": 30, "smoke_events_5yr": 4, "water_rights": "senior"}'),
      ('741 Barrier Island Rd', 'Galveston, TX', 9.0, 'Extreme', 'Low', 'High', 'Complete island inundation possible in Category 4+ hurricane', 'Barrier island property with highest vulnerability classification', '{"value_millions": 0.4, "storm_surge_cat4_ft": 18, "seawall_condition": "degrading", "evacuation_time_hr": 12}'),
      ('852 Mountain View Ct', 'Boulder, CO', 6.0, 'Moderate', 'Moderate', 'Low', 'Flash flood and wildfire risk from canyon proximity', 'Foothill property near canyon with dual natural hazard exposure', '{"value_millions": 1.1, "flash_flood_zone": true, "marshall_fire_proximity_mi": 5}'),
      ('963 Lakeshore Blvd', 'Chicago, IL', 5.5, 'Moderate', 'Low', 'Moderate', 'Lake Michigan erosion threatening shoreline properties', 'Lakefront property experiencing accelerated bluff erosion', '{"value_millions": 1.8, "erosion_rate_ft_yr": 3, "bluff_height_ft": 40, "great_lakes_level": "above_average"}'),
      ('174 Mangrove Way', 'Naples, FL', 8.7, 'Extreme', 'Low', 'High', 'Storm surge and sea level rise compounding, mangrove buffer declining', 'Waterfront estate with diminishing natural storm protection', '{"value_millions": 4.2, "mangrove_buffer_loss_pct": 30, "ian_damage": 250000, "insurance_premium_increase": "80%"}'),
      ('285 Prairie Wind Farm', 'Wichita, KS', 5.0, 'Low', 'Low', 'Moderate', 'Increasing tornado intensity and heat stress on agriculture', 'Rural property with improving renewable energy value offset', '{"value_millions": 0.3, "tornado_proximity_10yr": 2, "wind_lease_income": 15000, "crop_insurance": true}'),
      ('396 Redwood Heights', 'Santa Cruz, CA', 7.5, 'Moderate', 'High', 'Low', 'Compound risk from wildfire, landslide, and coastal erosion', 'Coastal mountain property with multiple climate hazard exposures', '{"value_millions": 1.5, "atmospheric_river_exposure": true, "landslide_zone": true, "czu_fire_proximity": true}')
    `);
    console.log('Real estate climate risk seeded.');

    // 14. Historical Climate Data (15 items)
    await pool.query(`
      INSERT INTO historical_climate_data (region, time_period, avg_temperature, avg_precipitation, notable_events, trend, description, data) VALUES
      ('Global', '1880-1920', 13.7, 1050.0, 'Krakatoa eruption 1883 causing global cooling, early industrialization', 'Pre-industrial baseline', 'Baseline period for measuring global temperature anomalies', '{"co2_ppm": 295, "sea_level_baseline": true, "population_billions": 1.6}'),
      ('Global', '1920-1960', 14.0, 1060.0, 'Dust Bowl 1930s, post-WWII industrial boom, nuclear testing era', 'Gradual warming', 'Early warming signal emerging from natural variability', '{"co2_ppm": 315, "aerosol_cooling": true, "temperature_anomaly": 0.2}'),
      ('Global', '1960-2000', 14.3, 1070.0, 'El Chichón 1982, Pinatubo 1991, strong El Niño 1997-98', 'Accelerating warming', 'Clear anthropogenic warming signal detected by IPCC', '{"co2_ppm": 370, "ozone_hole_discovered": true, "temperature_anomaly": 0.5}'),
      ('Global', '2000-2024', 14.9, 1080.0, 'Record heat years 2016/2020/2023, Paris Agreement 2015', 'Rapid warming', 'Warmest period in recorded history, 1.1°C above pre-industrial', '{"co2_ppm": 420, "arctic_ice_decline": "40%", "temperature_anomaly": 1.1}'),
      ('Arctic', '1950-2024', -12.0, 250.0, 'Northwest Passage opening, permafrost thaw acceleration', 'Amplified warming', 'Arctic warming 3-4x faster than global average', '{"warming_rate_multiplier": 3.5, "ice_free_summer_projected": 2035, "permafrost_thaw_depth_increase_cm": 50}'),
      ('US Southwest', '1900-2024', 18.5, 350.0, 'Mega-drought 2000-present, Colorado River crisis', 'Aridification', 'Persistent drought conditions unprecedented in 1200 years', '{"tree_ring_record": "1200 year worst", "lake_mead_decline_pct": 70, "groundwater_depletion": true}'),
      ('Amazon Basin', '1970-2024', 26.5, 2200.0, 'Deforestation acceleration, 2005/2010 mega-droughts', 'Drying trend', 'Approaching tipping point where rainforest converts to savanna', '{"deforestation_pct": 17, "tipping_point_pct": 25, "fire_increase": "300%"}'),
      ('Sahel', '1950-2024', 28.0, 480.0, '1968-1985 mega-drought, partial recovery since 1990s', 'Variable/Greening', 'Complex response showing some recovery but high vulnerability', '{"greening_trend": true, "rainfall_recovery_pct": 60, "population_growth_rate": "2.7%"}'),
      ('Antarctic', '1960-2024', -25.0, 200.0, 'Ozone hole discovery 1985, ice shelf collapses 2002-present', 'Complex changes', 'West Antarctic ice sheet showing acceleration, East stable', '{"west_ice_loss_gt_yr": 150, "larsen_b_collapse": 2002, "sea_level_contribution_mm_yr": 0.5}'),
      ('European Alps', '1900-2024', 6.0, 1200.0, 'Glacier retreat acceleration since 1980s, 2003/2022 heat waves', 'Rapid warming', 'Alpine glaciers lost 60% of volume, affecting water supply', '{"glacier_volume_loss_pct": 60, "permafrost_elevation_rise_m": 200, "ski_industry_impact": "severe"}'),
      ('Indian Ocean', '1950-2024', 27.5, 1800.0, 'IOD events intensifying, coral bleaching events', 'Warming ocean', 'Indian Ocean warming fastest of tropical oceans', '{"sst_increase_c": 1.2, "coral_bleaching_events": 5, "cyclone_intensity_increase": "15%"}'),
      ('Great Barrier Reef', '1980-2024', 26.0, 1600.0, 'Mass bleaching 1998/2002/2016/2017/2020/2022', 'Critical stress', 'Unprecedented frequency of mass coral bleaching events', '{"bleaching_events_since_1998": 7, "coral_cover_decline_pct": 50, "recovery_time_insufficient": true}'),
      ('Greenland', '1970-2024', -8.0, 500.0, 'Ice sheet mass loss accelerating, 2012/2019 extreme melt', 'Rapid ice loss', 'Greenland losing 280 billion tons of ice per year', '{"mass_loss_gt_yr": 280, "sea_level_contribution_mm_yr": 0.8, "dark_snow_effect": true}'),
      ('Mediterranean', '1960-2024', 16.5, 550.0, '2003/2022 extreme heat waves, wildfire increase', 'Hot-dry trend', 'Mediterranean identified as climate change hotspot', '{"warming_rate_vs_global": 1.5, "wildfire_area_increase_pct": 250, "tourism_impact": "growing"}'),
      ('Pacific Islands', '1950-2024', 27.0, 2800.0, 'Accelerating sea level rise, increased cyclone intensity', 'Existential threat', 'Small island developing states facing loss of territory', '{"sea_level_rise_mm_yr": 4, "island_area_loss_pct": 5, "climate_refugees": true}')
    `);
    console.log('Historical climate data seeded.');

    // 15. Climate Alerts (15 items)
    await pool.query(`
      INSERT INTO climate_alerts (alert_type, severity, region, message, active, expires_at, description, data) VALUES
      ('Heat Wave', 'Extreme', 'Southwest US', 'Dangerous heat wave expected with temperatures exceeding 120°F', true, '2025-07-20', 'Life-threatening heat conditions for vulnerable populations', '{"max_temp_f": 122, "duration_days": 7, "cooling_centers": 45, "mortality_risk": "very high"}'),
      ('Hurricane Watch', 'High', 'Gulf Coast', 'Category 4 hurricane expected to make landfall within 48 hours', true, '2025-09-15', 'Major hurricane threatening coastal communities', '{"storm_name": "Hurricane Carlos", "wind_mph": 145, "storm_surge_ft": 12, "evacuation_zones": ["A", "B"]}'),
      ('Flood Warning', 'Critical', 'Mississippi Valley', 'Major flooding expected along Mississippi River, levees at capacity', true, '2025-04-30', 'Historic flood levels threatening communities along the river', '{"river_stage_ft": 48, "flood_stage_ft": 35, "levee_stress": "critical", "evacuations": true}'),
      ('Wildfire Red Flag', 'Extreme', 'Southern California', 'Santa Ana winds creating extreme fire conditions', true, '2025-10-15', 'Critical fire weather with wind gusts exceeding 80 mph', '{"wind_gusts_mph": 85, "humidity_pct": 5, "fires_active": 3, "evacuations_ordered": true}'),
      ('Tornado Warning', 'Critical', 'Oklahoma/Kansas', 'Violent tornado outbreak expected, multiple supercells developing', true, '2025-05-20', 'Particularly dangerous situation with potential EF4+ tornadoes', '{"supercells_expected": 8, "tornado_probability": "high", "hail_size_inches": 4}'),
      ('Blizzard Warning', 'High', 'Northern Plains', 'Major blizzard with whiteout conditions and dangerous wind chills', true, '2025-01-25', 'Travel impossible, life-threatening wind chills below -50°F', '{"snowfall_inches": 24, "wind_mph": 55, "wind_chill_f": -55, "road_closures": true}'),
      ('Drought Emergency', 'Critical', 'Central Valley, CA', 'Emergency water restrictions enacted, agricultural curtailments', true, '2025-12-31', 'Severe water shortage requiring mandatory conservation measures', '{"restriction_level": "Stage 4", "agricultural_cut_pct": 50, "reservoir_pct": 22}'),
      ('Air Quality Alert', 'High', 'Pacific Northwest', 'Wildfire smoke creating hazardous air quality conditions', true, '2025-08-30', 'AQI exceeding 300, all outdoor activities should be avoided', '{"aqi": 350, "pm25": 280, "visibility_mi": 1, "n95_recommended": true}'),
      ('Coastal Erosion Alert', 'Moderate', 'Outer Banks, NC', 'Accelerated coastal erosion threatening structures along shoreline', true, '2025-06-30', 'Several properties at imminent risk of collapse into ocean', '{"erosion_rate_ft_yr": 8, "structures_at_risk": 25, "beach_width_ft": 15}'),
      ('Tsunami Watch', 'High', 'Pacific Coast', 'Large earthquake detected, tsunami waves possible within 4 hours', true, '2025-03-15', 'Coastal evacuations recommended as precautionary measure', '{"earthquake_magnitude": 8.2, "epicenter": "Aleutian Islands", "wave_arrival_hr": 4}'),
      ('Ice Storm Warning', 'High', 'Northeast US', 'Severe ice storm expected, up to 1 inch ice accumulation', true, '2025-02-10', 'Widespread power outages and dangerous travel conditions expected', '{"ice_accumulation_inches": 1.0, "power_outage_risk": "high", "tree_damage": "significant"}'),
      ('Volcanic Ash Advisory', 'Moderate', 'Pacific Northwest', 'Mt. Rainier showing increased seismic activity', true, '2025-12-31', 'Monitoring escalated, lahar warning systems activated', '{"seismic_events_daily": 25, "alert_level": "Watch", "lahar_zones_activated": true}'),
      ('Marine Heat Wave', 'High', 'Northeast Pacific', 'Record ocean temperatures threatening marine ecosystems', true, '2025-09-30', 'Blob 2.0 event causing massive marine ecosystem disruption', '{"sst_anomaly_c": 4.5, "coral_bleaching": true, "fishery_closures": 3}'),
      ('Permafrost Alert', 'Moderate', 'Alaska North Slope', 'Rapid permafrost thaw causing infrastructure damage', true, '2025-12-31', 'Roads, buildings, and pipelines at risk from ground subsidence', '{"thaw_depth_increase_cm": 30, "infrastructure_damage_millions": 50, "methane_release": true}'),
      ('Glacial Lake Outburst', 'Critical', 'Himalayan Region', 'Multiple glacial lakes at critical capacity, GLOF risk elevated', true, '2025-10-31', 'Downstream communities at risk from potential glacial lake floods', '{"lakes_at_risk": 8, "population_downstream_thousands": 500, "early_warning_systems": 3}')
    `);
    console.log('Climate alerts seeded.');

    console.log('\n✅ All seed data inserted successfully!');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
