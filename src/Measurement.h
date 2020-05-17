#pragma once

#include <iostream>
#include <fstream>

#include "State.h"

class Measurement
{
private:
	double v_av;
	int count;
    double m_eta;
	int m_N;
public:
	Measurement(double eta, int N);
	~Measurement();
	
	void measure(State &state);
private:
    const static int binSize = 1000;
	std::ofstream binOut;
	std::string OUTFILE;
	void outputMeasurement();
};