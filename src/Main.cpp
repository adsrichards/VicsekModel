#include <iostream>
#include <fstream>
#include <random>

#include "State.h"
#include "Measurement.h"

void Simulation(double eta, int N)
{
    State state(eta, N);
    Measurement measurement(eta, N);

    const int eqmcs = 1000;
    const int mcs = 10*eqmcs;

    // Equilibration
    for(int i=0; i<eqmcs; i++)
    {
        state.step();
    }
    
    // Measurement
    for(int i=0; i<mcs; i++)
    {
        state.step(); 
        measurement.Measure(state);
    }
}

int main()
{
    double eta = 0.2;
    int N = 400;

    Simulation(eta, N);
}
