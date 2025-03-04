
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { defaultQuestions } from '@/utils/questions';

interface QuestionFormProps {
  onSubmit: (answers: { question: string; answer: string }[]) => void;
  creatorName: string;
}

const QuestionForm = ({ onSubmit, creatorName }: QuestionFormProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState(defaultQuestions.slice(0, 10));
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleQuestionChange = (index: number, questionId: number) => {
    const newSelectedQuestions = [...selectedQuestions];
    const newQuestion = defaultQuestions.find(q => q.id === questionId);
    if (newQuestion) {
      newSelectedQuestions[index] = newQuestion;
      setSelectedQuestions(newSelectedQuestions);
    }
  };

  const addCustomQuestion = () => {
    if (customQuestion.trim() && customAnswer.trim()) {
      const newQuestion = {
        id: Date.now(),
        text: customQuestion,
        custom: true
      };
      
      if (selectedQuestions.length < 10) {
        setSelectedQuestions([...selectedQuestions, newQuestion]);
        setAnswers([...answers, customAnswer]);
      } else {
        // Replace the last question
        const newQuestions = [...selectedQuestions];
        newQuestions[9] = newQuestion;
        setSelectedQuestions(newQuestions);
        
        const newAnswers = [...answers];
        newAnswers[9] = customAnswer;
        setAnswers(newAnswers);
      }
      
      setCustomQuestion('');
      setCustomAnswer('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAnswers = selectedQuestions.map((question, index) => ({
      question: question.text.replace('[NAME]', creatorName),
      answer: answers[index]
    }));
    onSubmit(formattedAnswers);
  };

  const isCurrentStepValid = () => {
    if (currentStep < 5) {
      return answers.slice(currentStep * 2, (currentStep + 1) * 2).every(a => a.trim());
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {currentStep < 5 ? (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
            <p className="text-muted-foreground">
              Answer these questions so your partner can test how well they know you.
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              {[0, 1, 2, 3, 4].map(step => (
                <div 
                  key={step}
                  className={`h-1.5 w-6 rounded-full ${
                    step === currentStep ? 'bg-primary' : 
                    step < currentStep ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {selectedQuestions.slice(currentStep * 2, (currentStep + 1) * 2).map((question, localIndex) => {
              const globalIndex = currentStep * 2 + localIndex;
              return (
                <Card key={globalIndex} className="p-4 transition-all duration-300 hover:shadow-elevation-medium">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">
                        {question.text.replace('[NAME]', creatorName)}
                      </Label>
                      
                      <select 
                        className="text-xs bg-secondary px-2 py-1 rounded focus-ring"
                        onChange={(e) => handleQuestionChange(globalIndex, Number(e.target.value))}
                        value={question.id}
                      >
                        {defaultQuestions.map(q => (
                          <option key={q.id} value={q.id}>
                            {q.text.substring(0, 20)}...
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      placeholder="Your answer"
                      value={answers[globalIndex] || ''}
                      onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="transition-all"
              >
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button 
                type="button" 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="ml-auto transition-all"
                disabled={!isCurrentStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="ml-auto transition-all"
                disabled={!isCurrentStepValid()}
              >
                Custom Questions
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Add Custom Questions (Optional)</h2>
            <p className="text-muted-foreground">
              Want to make your puzzle more personal? Add your own questions!
            </p>
          </div>
          
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customQuestion">Your Question</Label>
                <Input
                  id="customQuestion"
                  placeholder="e.g., What was our first date spot?"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="customAnswer">The Answer</Label>
                <Input
                  id="customAnswer"
                  placeholder="e.g., Central Park"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={addCustomQuestion}
                disabled={!customQuestion.trim() || !customAnswer.trim()}
                className="w-full"
              >
                Add Question
              </Button>
            </div>
            
            {selectedQuestions.some(q => (q as any).custom) && (
              <div className="mt-6">
                <Separator className="my-4" />
                <h3 className="font-medium mb-3">Your Custom Questions:</h3>
                <ul className="space-y-2">
                  {selectedQuestions
                    .filter(q => (q as any).custom)
                    .map((q, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium">{q.text}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(4)}
              className="transition-all"
            >
              Back
            </Button>
            <Button 
              type="submit"
              className="transition-all"
            >
              Generate Puzzle
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};

export default QuestionForm;
