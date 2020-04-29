#include "State.h"
#include <math.h>
#include <iostream>
#include <random>

// Mersenne twister RNG
std::random_device rd;
int seed = rd();
std::mt19937 gen(seed);
std::uniform_real_distribution<double> dis(0.0, 1.0);

State::State(double eta, int N)
    : m_N(N), m_eta(eta)
{

    for(int i=0; i<m_N; i++)
    {
        r.push_back(dis(gen)*L); // x coordinates
        r.push_back(dis(gen)*L); // y coordinates
        theta.push_back(0.5); // theta
    }
}

State::~State()
{
}

void State::update(int index, double rx_av, double ry_av)
{
    double newTheta = remainder(atan2(ry_av, rx_av) + m_eta*(2*dis(gen) - 1), 2*M_PI);
    theta[index] = newTheta;
    r[2*index + 0] += v*cos(newTheta);
    r[2*index + 1] += v*sin(newTheta);
    r[2*index + 0] = remainder(r[2*index + 0] + L, L);
    r[2*index + 1] = remainder(r[2*index + 1] + L, L);
}

void State::step()
{
    for(int i=0; i<m_N; i++)
    {
        double rx_av = 0;
        double ry_av = 0;
        for(int j=0; j<m_N; j++)
        {
            double rijx = r[2*j+0] - r[2*i+0];
            double rijy = r[2*j+1] - r[2*i+1];
            double rij2 = rijx*rijx + rijy*rijy;
            if (rij2 < R*R)
            {
                rx_av += cos(theta[j]);
                ry_av += sin(theta[j]);
            }
        }
        update(i, rx_av, ry_av);
    }
}