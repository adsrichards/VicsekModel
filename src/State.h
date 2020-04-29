#pragma once

#include <vector>

class State
{
    friend class Measurement;
private:
    int L = 500;
    int m_N;

    double v = 2.5;
    double R = 25;
    double m_eta;

    std::vector<double> r;
    std::vector<double> theta;
public:
    State(double eta, int N);
    ~State();
    
    void step();
private:
    void update(int index, double rx_av, double ry_av);
};