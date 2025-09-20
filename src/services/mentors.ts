export const mockMentorService = {
  getMentors: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return [
      {
        id: 'mentor-1',
        name: 'Dr. Alex Chen',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150',
        title: 'Senior AI Scientist at Innovate Inc.',
        skills: ['AI/ML', 'Data Science', 'Python', 'Deep Learning'],
        bio: 'Passionate about leveraging AI to solve real-world problems. 10+ years of experience in the field.',
        impactScore: 1200,
        availability: 'Mon, Wed, Fri afternoons'
      },
      {
        id: 'mentor-2',
        name: 'Maria Rodriguez',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=150',
        title: 'Lead Frontend Engineer at TechSolutions',
        skills: ['JavaScript', 'React', 'UX Design', 'Next.js'],
        bio: 'Specializing in creating beautiful and intuitive user interfaces. Happy to help with all things frontend.',
        impactScore: 950,
        availability: 'Tue, Thu evenings'
      },
      {
        id: 'mentor-3',
        name: 'David Lee',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150',
        title: 'Cybersecurity Analyst at SecureNet',
        skills: ['Cybersecurity', 'Networking', 'Ethical Hacking'],
        bio: 'Protecting digital assets and mentoring the next generation of cybersecurity experts.',
        impactScore: 800,
        availability: 'Weekends'
      }
    ];
  }
};
